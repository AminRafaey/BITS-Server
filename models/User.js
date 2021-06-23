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

schema.methods.generateAuthToken = function (mobileNumber) {
  console.log(this);
  return jwt.sign(
    {
      _id: this._id,
      type: this.type,
      ...(this.employeeId && {
        quickSend: this.employeeId.quickSend,
        contactManagement: this.employeeId.contactManagement,
        templateManagement: this.employeeId.templateManagement,
        labelManagement: this.employeeId.labelManagement,
        inbox: this.employeeId.inbox,
        adminId: this.employeeId.adminId,
      }),
      ...(this.adminId && {
        adminId: this.adminId._id,
      }),
      mobileNumber: mobileNumber,
      createdAt: new Date(),
    },
    config.get('jwtPrivateKey')
  );
};

schema.methods.generateVerificationToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      type: this.type,
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
