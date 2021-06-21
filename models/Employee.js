const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const jwt = require('jsonwebtoken');
const config = require('config');

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
    enum: ['Active', 'Blocked', 'Not-Verified'],
    default: 'Not-Verified',
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

  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },

  createdAt: {
    type: Date,
    default: Date(),
  },
  quickSend: {
    type: String,
    enum: ['allow', 'not-allow'],
    default: 'not-allow',
  },
  contactManagement: {
    type: String,
    enum: ['allow', 'not-allow'],
    default: 'not-allow',
  },
  templateManagement: {
    type: String,
    enum: ['allow', 'not-allow'],
    default: 'not-allow',
  },
  labelManagement: {
    type: String,
    enum: ['allow', 'not-allow'],
    default: 'not-allow',
  },
  inbox: {
    type: String,
    enum: ['allow', 'not-allow'],
    default: 'not-allow',
  },
  updatedAt: {
    type: Date,
  },
});

schema.methods.generateVerificationToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      type: 'Employee',
      createdAt: new Date(),
    },
    config.get('jwtPrivateKey')
  );
};

function validateEmployee(employee) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().allow('').optional(),
    designation: Joi.string().required(),
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
