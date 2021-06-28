const express = require('express');
const router = express.Router();
const phone = require('phone');
const { Employee, validateEmployee } = require('../models/Employee');
const { Admin } = require('../models/Admin');
const { User } = require('../models/User');
const {
  validateFilter,
  validateEmployeeStatus,
  validateEmployeeAccessUpdate,
  validateEmployeeUpdate,
} = require('./RouteHelpers/Employee');
const { validateObjectId } = require('./RouteHelpers/Common');
const { sendEmployeeVerificationEmail } = require('./Helper/Email');

const auth = require('../Middlewares/auth');
const isAdmin = require('../Middlewares/isAdmin');

router.post('/', auth, isAdmin, async (req, res) => {
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
    const { adminId } = req.user;

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
      (await Employee.findOne({
        email: employeeData.email,
      })) ||
      (await User.findOne({
        email: employeeData.email,
      }))
    ) {
      return res.status(400).send({
        field: {
          name: 'email',
          message: 'Email already Exist',
        },
      });
    }

    if (
      !(await Admin.findOne({
        _id: adminId,
      }))
    ) {
      return res.status(400).send({
        field: {
          name: 'adminId',
          message: 'No Admin belongs to the provided admin ID',
        },
      });
    }

    const employee = await new Employee({
      ...employeeData,
      adminId: adminId,
    }).save();
    const token = employee.generateVerificationToken();

    await sendEmployeeVerificationEmail(
      employeeData.email,
      token,
      req.get('origin')
    );

    res.status(200).send({
      field: {
        message: 'An email has been sent successfully',
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

router.post('/resendVerificationEmail', auth, isAdmin, async (req, res) => {
  try {
    const { employeeId } = req.body;
    const { error } = validateObjectId({ _id: employeeId });
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(400).send({
        field: {
          message: 'No employee belong to the provided employee ID',
          name: 'employeeId',
        },
      });
    }

    if (employee.adminId != req.user.adminId) {
      return res.status(400).send({
        field: {
          message: 'This user doesnot belong to the provided admin ID',
          name: 'adminId',
        },
      });
    }

    const token = employee.generateVerificationToken();

    await sendEmployeeVerificationEmail(
      employee.email,
      token,
      req.get('origin')
    );

    res.status(200).send({
      field: {
        message: 'An email has been sent successfully',
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

router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const { adminId } = req.user;
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Employee.find({ adminId: adminId }),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const { _id } = req.query;
    const { adminId } = req.user;
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
        data: await Employee.findOne({ _id, adminId }),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get('/filter', auth, isAdmin, async (req, res) => {
  try {
    const { adminId } = req.user;
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
        { adminId: adminId },
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

router.put('/', auth, isAdmin, async (req, res) => {
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
      email,
      adminId: leadAdminId,
      ...data
    } = req.body;
    const { adminId } = req.user;
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
    const employee = await Employee.findById(_id);
    if (!employee) {
      return res.status(400).send({
        field: {
          name: 'employeeId',
          message: 'No Employee with this Id exist',
        },
      });
    }
    if (employee.adminId != adminId) {
      return res.status(400).send({
        field: {
          name: 'adminId',
          message: 'This employee do not belong to this admin',
        },
      });
    }
    const { mobileNumber } = data;

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

router.put('/access', auth, isAdmin, async (req, res) => {
  try {
    const { employees } = req.body;
    const { adminId } = req.user;
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
        { _id: _id, adminId },
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

router.delete('/', auth, isAdmin, async (req, res) => {
  try {
    const { adminId } = req.user;
    const employeeId = req.query.employeeId;

    const { error } = validateObjectId({ _id: employeeId });
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    const deleted = await Employee.deleteOne({
      _id: employeeId,
      adminId,
    });

    deleted.deletedCount &&
      (await User.deleteOne({
        employeeId: employeeId,
      }));

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

router.get('/allDesignations', auth, isAdmin, async (req, res) => {
  try {
    const { adminId } = req.user;
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Employee.find({ adminId }).distinct('designation', {
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

router.put('/status', auth, isAdmin, async (req, res) => {
  try {
    const { adminId } = req.user;
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

    const employee = await Employee.findById(_id);
    if (!employee) {
      return res.status(400).send({
        field: {
          name: 'employeeId',
          message: 'No Employee with this Id exist',
        },
      });
    }

    if (employee.adminId != adminId) {
      return res.status(400).send({
        field: {
          name: 'adminId',
          message: 'This employee do not belong to this admin',
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
