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
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
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
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });
  return schema.validate(employee);
}

const Employee = mongoose.model('Employee', schema);
exports.Employee = Employee;
exports.validateEmployee = validateEmployee;
