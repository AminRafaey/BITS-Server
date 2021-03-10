const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = new mongoose.Schema({
  title: {
    type: String,
    min: 2,
    max: 30,
  },

  jid: {
    type: String,
    required: true,
  },

  email: {
    type: String,
  },

  source: {
    type: String,
  },

  location: {
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
  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Label',
    },
  ],
  createdAt: {
    type: Date,
    default: Date(),
  },
});

//.regex(/^(92)\d{10}$/)

function validateLead(lead) {
  const schema = Joi.object({
    title: Joi.string().optional(),
    jid: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .optional(),
    source: Joi.string().optional(),
    location: Joi.string().optional(),
    labels: Joi.array().items(Joi.objectId()),
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
