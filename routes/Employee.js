const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const phone = require('phone');
const { Employee, validateEmployee } = require('../models/Employee');
const { Admin } = require('../models/Admin');
const { User } = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { error } = validateEmployee(req.body);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }
    const { email, password, userName, adminId, ...employeeData } = req.body;

    if (phone(employeeData.mobileNumber).length === 0) {
      return res.status(400).send({
        field: {
          name: 'mobileNumber',
          message: 'Mobile number is not valid',
        },
      });
    }

    if (
      await Employee.findOne({
        mobileNumber: employeeData.mobileNumber,
      })
    ) {
      return res.status(400).send({
        field: {
          name: 'mobileNumber',
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

    if (!(await Admin.findById(adminId))) {
      return res.status(400).send({
        field: {
          name: 'adminId',
          message: 'No Admin with this id exist',
        },
      });
    }

    const employee = await new Employee(employeeData).save();

    const user = await new User({
      email,
      userName,
      password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
      adminId: adminId,
      employeeId: employee._id,
      type: 'Employee',
    })
      .save()
      .then((res) => res.populate('adminId employeeId').execPopulate());

    const token = user.generateAuthToken();

    res
      .header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .status(200)
      .send({
        field: {
          message: 'Successfully registered',
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
