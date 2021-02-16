const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date(),
  },
});

function validateLabel(label) {
  const schema = Joi.object({
    title: Joi.string().required(),
    color: Joi.string().required(),
  });
  return schema.validate(label);
}

const Label = mongoose.model('Label', schema);
exports.Label = Label;
exports.validateLabel = validateLabel;
