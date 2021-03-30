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
    lastName: Joi.string().optional(),
    leadSource: Joi.string().optional(),
    companyName: Joi.string().optional(),
    labels: Joi.array().items(Joi.objectId()),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .optional(),
    phone: Joi.string().optional(),
    website: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zip: Joi.string().optional(),
    country: Joi.string().optional(),
    notes: Joi.array()
      .items(
        Joi.object()
          .keys({
            content: Joi.string().required(),
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
