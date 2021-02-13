const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
  name: {
    type: String,
    min: 2,
    max: 30,
    required: true,
  },

  mobileNumber: {
    type: String,
    min: 12,
    max: 12,
    required: true,
    unique: true,
  },

  date: {
    type: Date,
    default: new Date(),
  },
});

function validateContact(contact) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    mobileNumber: Joi.string()
      .regex(/^(92)\d{10}$/)
      .required(),
  });
  return schema.validate(contact);
}

const Contact = mongoose.model('Contact', schema);
exports.Contact = Contact;
exports.validateContact = validateContact;
