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
    enum: ['Admin', 'teamMember'],
    default: 'Admin',
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  teamMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
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
    type: Joi.string().valid('Admin', 'teamMember').optional(),
    adminId: Joi.objectId().optional(),
    teamMemberId: Joi.objectId().optional(),
    verified: Joi.optional(),
  });
  return schema.validate(user);
}

const User = mongoose.model('User', schema);
exports.User = User;
exports.validateUser = validateUser;
