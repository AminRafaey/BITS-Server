const express = require('express');
const router = express.Router();

const { User } = require('../models/User');
const {
  validateUserForLogin,
  validateEmployeeAccount,
  validateEmail,
  validatePasswordConfirmation,
} = require('./RouteHelpers/Auth.js');
const bcrypt = require('bcrypt');
const { Employee } = require('../models/Employee');
const { Admin } = require('../models/Admin');
const { sendPasswordVerificationEmail } = require('./Helper/Email');

const auth = require('../Middlewares/auth');
const isEmployee = require('../Middlewares/isEmployee');

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
      .populate('adminId employeeId');
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
    let token;
    if (user.type === 'Employee') {
      if (user.employeeId.status !== 'Active') {
        return res.status(400).send({
          field: {
            name: 'Status',
            message: 'Your account is blocked, Please contact admin.',
          },
        });
      }
      const admin = await Admin.findById(user.employeeId.adminId);
      token = user.generateAuthToken(
        admin.mobileNumber,
        user.employeeId.firstName + (user.employeeId.lastName || '')
      );
    } else {
      token = user.generateAuthToken(
        user.adminId.mobileNumber,
        user.adminId.fullName
      );
    }

    return res
      .header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .status(200)
      .send({
        field: {
          message: 'Successful',
          name: 'successful',
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.post('/employeeAccount', auth, isEmployee, async (req, res) => {
  try {
    const { error } = validateEmployeeAccount(req.body);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    const { userName, password } = req.body;
    const { _id: employeeId } = req.user;

    if (
      await User.findOne({
        userName: userName,
      })
    ) {
      return res.status(400).send({
        field: {
          name: 'userName',
          message: 'user Name already Exist',
        },
      });
    }
    const employee = await Employee.findOne({
      _id: employeeId,
    });
    if (!employee) {
      return res.status(400).send({
        field: {
          name: 'employeeId',
          message: 'No Employee belongs to the provided Employee ID',
        },
      });
    }

    if (
      await User.findOne({
        employeeId: employeeId,
      })
    ) {
      return res.status(400).send({
        field: {
          name: 'employeeId',
          message: 'This link has been used once',
        },
      });
    }

    await Employee.updateOne(
      { _id: employeeId },
      { status: 'Active', updatedAt: Date() }
    );

    const user = await new User({
      employeeId: employeeId,
      email: employee.email,
      userName: userName,
      password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
      type: 'Employee',
      verified: new Date(),
    })
      .save()
      .then((res) => res.populate('employeeId').execPopulate());

    const token = user.generateAuthToken();
    res
      .header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .status(200)
      .send({
        field: {
          message: 'Successful',
          name: 'successful',
          data: user.employeeId,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.post('/forgotPassword', async (req, res) => {
  try {
    const { error } = validateEmail(req.body);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: 'error',
        },
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({
        field: {
          message: 'We are not able to find any user',
          name: 'error',
        },
      });
    }

    const token = user.generateEmailVerificationToken();
    await sendPasswordVerificationEmail(user.email, token, req.get('origin'));

    return res.status(200).send({
      field: {
        message: 'We have sent a password recover instruction to your email',
        name: 'success',
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'error' },
    });
  }
});

router.post('/resetPassword', auth, async (req, res) => {
  try {
    const { error } = validatePasswordConfirmation(req.body);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    const { password, confirmPassword } = req.body;
    const { _id } = req.query;

    if (password !== confirmPassword) {
      return res.status(400).send({
        field: {
          message: 'Password and confirm password field do not match',
          name: 'Password',
        },
      });
    }

    await User.updateOne(
      { _id },
      {
        password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
        verified: new Date(),
      }
    );

    return res.status(200).send({
      field: {
        message: 'Password has been updated successfully',
        name: 'successful',
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});
module.exports = router;
