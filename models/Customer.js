const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
  },

  profile: {
    type: String,
  },

  country: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date(),
  },
});

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().required(),

    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    profile: Joi.string().optional(),
    country: Joi.string().required(),
  });
  return schema.validate(customer);
}

const Customer = mongoose.model('Customer', schema);
exports.Customer = Customer;
exports.validateCustomer = validateCustomer;
