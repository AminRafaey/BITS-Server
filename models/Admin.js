const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const schema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
});

function validateAdmin(admin) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    userName: Joi.string().required(),
    fullName: Joi.string().required(),
    password: Joi.string().trim().strict().min(4).max(30).required(),
    type: Joi.string().valid('Admin').optional(),
    mobileNumber: Joi.string().required(),
  });
  return schema.validate(admin);
}

const Admin = mongoose.model('Admin', schema);
exports.Admin = Admin;
exports.validateAdmin = validateAdmin;
