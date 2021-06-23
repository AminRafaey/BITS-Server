const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
  title: {
    type: String,
  },
  color: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date(),
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
});

function validateLabel(label) {
  const schema = Joi.object({
    title: Joi.string().required(),
    color: Joi.string().required(),
    description: Joi.string().allow('').optional(),
  });
  return schema.validate(label);
}

const Label = mongoose.model('Label', schema);
exports.Label = Label;
exports.validateLabel = validateLabel;
