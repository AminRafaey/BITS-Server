const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const phone = require('phone');
const { Admin, validateAdmin } = require('../models/Admin');
const { User } = require('../models/User');
const { sendVerificationEmail } = require('./Helper/Email');
const { validateObjectId } = require('./RouteHelpers/Common');

router.post('/', async (req, res) => {
  try {
    const { error } = validateAdmin(req.body);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }
    const { email, password, userName, ...adminData } = req.body;

    if (phone(adminData.mobileNumber).length === 0) {
      return res.status(400).send({
        field: {
          name: 'mobileNumber',
          message: 'Mobile number is not valid',
        },
      });
    }

    if (
      await Admin.findOne({
        mobileNumber: adminData.mobileNumber,
      })
    ) {
      return res.status(400).send({
        field: {
          name: 'Admin',
          message: 'Mobile number already exist',
        },
      });
    }

    if (
      await User.findOne({
        email: email,
      })
    ) {
      return res.status(400).send({
        field: {
          name: 'email',
          message: 'Email already Exist',
        },
      });
    }
    if (
      await User.findOne({
        userName: userName,
      })
    ) {
      return res.status(400).send({
        field: {
          name: 'user name',
          message: 'User Name already Exist',
        },
      });
    }

    const admin = await new Admin(adminData).save();
    const user = await new User({
      email,
      userName,
      password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
      adminId: admin._id,
      type: 'Admin',
    }).save();

    const token = user.generateVerificationToken();
    await sendVerificationEmail(user.email, token, req.get('origin'));

    res.status(200).send({
      field: {
        message: 'An email has been sent successfully',
        name: 'successful',
        data: { email: user.email, _id: user._id },
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.post('/resendVerificationEmail', async (req, res) => {
  try {
    const { userId } = req.body;
    const { error } = validateObjectId({ _id: userId });
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    const user = await User.findById(userId);

    if (user.verified) {
      return res.status(200).send({
        field: {
          message: 'User is already verified',
          name: 'successful',
        },
      });
    }
    const token = user.generateVerificationToken();
    await sendVerificationEmail(user.email, token, req.get('origin'));

    res.status(200).send({
      field: {
        message: 'An email has been sent successfully',
        name: 'successful',
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/accountVerification', async (req, res) => {
  try {
    const { userId } = req.body;
    const { error } = validateObjectId({ _id: userId });
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    await User.updateOne({ _id: userId }, { verified: new Date() });
    const user = await User.findById(userId);

    const token = user.generateAuthToken();
    return res
      .header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .status(200)
      .send({
        field: {
          message: 'An account has been verified',
          name: 'successful',
        },
      });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});


//       .then((res) => res.populate('adminId').execPopulate());

module.exports = router;
