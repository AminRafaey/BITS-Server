const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const phone = require('phone');
const { Employee, validateEmployee } = require('../models/Employee');
const { Admin } = require('../models/Admin');
const { User } = require('../models/User');
const {
  validateFilter,
  validateEmployeeUpdate,
} = require('./RouteHelpers/Employee');
const { validateObjectId } = require('./RouteHelpers/Common');

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

router.get('/all', async (req, res) => {
  try {
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Employee.find(),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { _id } = req.query;
    const { error } = validateObjectId(req.query);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Employee.findById(_id),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get('/filter', async (req, res) => {
  try {
    req.query = JSON.stringify(req.query);
    req.query = JSON.parse(req.query);
    Object.keys(req.query).map(
      (f) => (req.query[f] = req.query[f].map((obj) => JSON.parse(obj)))
    );
    Object.keys(req.query).map((f) => (req.query[f] = eval(req.query[f])));

    const {
      firstNames = [{}],
      lastNames = [{}],
      designations = [{}],
      mobileNumbers = [{}],
      statuses = [{}],
    } = req.query;

    const { error } = validateFilter(req.query);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    const query = eval({
      $and: [
        { $or: [...firstNames] },
        { $or: [...lastNames] },
        { $or: [...designations] },
        { $or: [...mobileNumbers] },
        { $or: [...statuses] },
      ],
    });

    const employees = await Employee.find(query);

    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: employees,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/', async (req, res) => {
  try {
    const { _id, createdAt, __v, updatedAt, ...data } = req.body;

    const { error } = validateEmployeeUpdate(data);
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    const { error: error2 } = validateObjectId({ _id: _id });
    if (error2) {
      return res.status(400).send({
        field: {
          message: error2.details[0].message,
          name: error2.details[0].path[0],
        },
      });
    }

    if (!(await Employee.findById(_id))) {
      return res.status(400).send({
        field: {
          name: 'Employee Id',
          message: 'No Employee with this Id exist',
        },
      });
    }

    const { mobileNumber } = data;

    if (mobileNumber && phone(mobileNumber).length === 0) {
      return res.status(400).send({
        field: {
          name: 'phone',
          message: 'Phone number is not valid',
        },
      });
    }

    if (
      mobileNumber &&
      (await Employee.findOne().and([
        {
          mobileNumber: mobileNumber,
        },
        { _id: { $ne: _id } },
      ]))
    ) {
      return res.status(400).send({
        field: {
          name: 'phone',
          message:
            'Sorry, duplicate Employee found with the same phone number.',
        },
      });
    }

    await Employee.updateOne({ _id: _id }, { ...data, updatedAt: Date() });

    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: await Employee.findById(_id),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.delete('/', async (req, res) => {
  try {
    const employeeId = req.query.employeeId;

    const { error } = validateObjectId({ _id: employeeId });
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    await Employee.deleteOne({
      _id: employeeId,
    });

    await User.deleteOne({
      employeeId: employeeId,
    });

    res.send({
      field: {
        name: 'successful',
        message: 'Successfully Deleted',
        data: {},
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

module.exports = router;
