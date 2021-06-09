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
  validateEmployeeStatus,
  validateEmployeeAccessUpdate,
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

    const { ...employeeData } = req.body;

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
      await Employee.findOne({
        email: employeeData.email,
      })
    ) {
      return res.status(400).send({
        field: {
          name: 'email',
          message: 'Email already Exist',
        },
      });
    }

    const employee = await new Employee(employeeData).save();

    res.status(200).send({
      field: {
        message: 'Successfully registered',
        name: 'successful',
        data: employee,
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
      emails = [{}],
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
        { $or: [...emails] },
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
    const {
      _id,
      quickSend,
      contactManagement,
      templateManagement,
      labelManagement,
      inbox,
      createdAt,
      __v,
      updatedAt,
      ...data
    } = req.body;

    const { error } = validateEmployee(data);
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
          name: 'employeeId',
          message: 'No Employee with this Id exist',
        },
      });
    }

    const { mobileNumber, email } = data;

    if (mobileNumber && phone(mobileNumber).length === 0) {
      return res.status(400).send({
        field: {
          name: 'mobileNumber',
          message: 'mobile number is not valid',
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
          name: 'mobileNumber',
          message:
            'Sorry, duplicate Employee found with the same mobile number.',
        },
      });
    }

    if (
      email &&
      (await Employee.findOne().and([
        {
          email: email,
        },
        { _id: { $ne: _id } },
      ]))
    ) {
      return res.status(400).send({
        field: {
          name: 'email',
          message: 'Sorry, duplicate Employee found with the same email.',
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

router.put('/access', async (req, res) => {
  try {
    const { employees } = req.body;
    for (let employee of employees) {
      const { error } = validateEmployeeAccessUpdate(employee);
      if (error)
        return res.status(400).send({
          field: {
            message: error.details[0].message,
            name: error.details[0].path[0],
          },
        });
    }

    for (let employee of employees) {
      const {
        _id,
        quickSend,
        contactManagement,
        templateManagement,
        labelManagement,
        inbox,
      } = employee;
      await Employee.updateOne(
        { _id: _id },
        {
          ...{
            quickSend,
            contactManagement,
            templateManagement,
            labelManagement,
            inbox,
          },
          updatedAt: Date(),
        }
      );
    }

    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: [],
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

router.get('/allDesignations', async (req, res) => {
  try {
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Employee.find().distinct('designation', {
          designation: { $nin: ['', null] },
        }),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/status', async (req, res) => {
  try {
    const { _id, status } = req.body;

    const { error } = validateEmployeeStatus({ status: status });
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
          name: 'employeeId',
          message: 'No Employee with this Id exist',
        },
      });
    }

    await Employee.updateOne(
      { _id: _id },
      { status: status, updatedAt: Date() }
    );

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

module.exports = router;
