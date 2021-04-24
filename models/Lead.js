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

  leadSource: {
    type: String,
  },

  companyName: {
    type: String,
  },

  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Label',
    },
  ],
  email: {
    type: String,
  },

  phone: {
    type: String,
  },

  website: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
    type: String,
  },
  country: {
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
      editedAt: {
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
    firstName: Joi.string().required(),
    lastName: Joi.string().allow('').optional(),
    leadSource: Joi.string().allow('').optional(),
    companyName: Joi.string().allow('').optional(),
    labels: Joi.array().items(Joi.objectId()),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .allow('')
      .optional(),
    phone: Joi.string().allow('').optional(),
    website: Joi.string().allow('').optional(),
    address: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    zip: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    notes: Joi.array()
      .items(
        Joi.object()
          .keys({
            content: Joi.string().required(),
            _id: Joi.string().optional(),
            editedAt: Joi.string().optional(),
            createdAt: Joi.string().optional(),
          })
          .optional()
      )
      .optional(),
  });
  return schema.validate(lead);
}

const Lead = mongoose.model('Lead', schema);
exports.Lead = Lead;
exports.validateLead = validateLead;
