const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
  },

  designation: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active',
  },

  mobileNumber: {
    type: String,
    required: true,
  },

  joiningDate: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date(),
  },
  updatedAt: {
    type: Date,
  },
});

function validateEmployee(employee) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().allow('').optional(),
    designation: Joi.string().required(),
    status: Joi.string().valid('Active', 'Blocked').required(),
    mobileNumber: Joi.string().required(),
    joiningDate: Joi.date().required(),
    adminId: Joi.objectId().required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    userName: Joi.string().required(),
    password: Joi.string().trim().strict().min(4).max(30).required(),
    type: Joi.string().valid('Employee').optional(),
  });
  return schema.validate(employee);
}

const Employee = mongoose.model('Employee', schema);
exports.Employee = Employee;
exports.validateEmployee = validateEmployee;
