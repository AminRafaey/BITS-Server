const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const jwt = require('jsonwebtoken');
const config = require('config');

const schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  userName: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Admin', 'Employee'],
    default: 'Admin',
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  verified: {
    type: Date,
    default: '',
  },
});

schema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      type: this.type,
      mobileNumber: this.adminId.mobileNumber,
      ...(this.employeeId && { adminId: this.adminId._id }),
      createdAt: new Date(),
    },
    config.get('jwtPrivateKey')
  );
};

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    userName: Joi.string().required(),
    password: Joi.string().trim().strict().min(4).max(30).required(),
    type: Joi.string().valid('Admin', 'Employee').optional(),
    adminId: Joi.objectId().optional(),
    employeeId: Joi.objectId().optional(),
    verified: Joi.optional(),
  });
  return schema.validate(user);
}

const User = mongoose.model('User', schema);
exports.User = User;
exports.validateUser = validateUser;
