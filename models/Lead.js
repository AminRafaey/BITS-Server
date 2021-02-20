const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
  title: {
    type: String,
    min: 2,
    max: 30,
  },

  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
  },

  source: {
    type: String,
  },

  notes: [
    {
      content: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date(),
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date(),
  },
});

function validateLead(lead) {
  const schema = Joi.object({
    title: Joi.string().optional(),
    mobileNumber: Joi.string()
      .regex(/^(92)\d{10}$/)
      .required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .optional(),
    source: Joi.string().optional(),
    notes: Joi.array()
      .items(
        Joi.object()
          .keys({
            content: Joi.string().required(),
          })
          .required()
      )
      .optional(),
  });
  return schema.validate(lead);
}

const Lead = mongoose.model('Lead', schema);
exports.Lead = Lead;
exports.validateLead = validateLead;
