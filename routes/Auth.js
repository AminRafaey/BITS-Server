const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { validateUserForLogin } = require('./RouteHelpers/Auth.js');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  try {
    const { error } = validateUserForLogin(req.body);
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    const { email, userName, password } = req.body;

    const user = await User.findOne()
      .or([{ email: email }, { userName: userName }])
      .populate('adminId');
    console.log(user);
    if (!user || (user && user.verified == null)) {
      if (user && user.verified == null)
        return res.status(400).send({
          field: {
            name: 'Account',
            message: 'Account is not verified',
          },
        });

      return res.status(400).send({
        field: {
          name: 'email or mobile Number',
          message: 'No User with this email or user name exist',
        },
      });
    }

    let authentication = await bcrypt.compare(password, user.password);
    if (!authentication)
      return res.status(400).send({
        field: {
          message: 'Invalid username or password',
        },
      });

    const token = user.generateAuthToken();

    res
      .header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .status(200)
      .send({
        field: {
          message: 'Successful',
          data: user,
          name: 'successful',
        },
      });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

module.exports = router;
