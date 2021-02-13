const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
  name: {
    type: String,
    min: 2,
    max: 60,
    required: true,
    unique: true,
  },

  content: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['Default', 'Not_Default'],
    default: 'Not_Default',
  },

  date: {
    type: Date,
    default: new Date(),
  },
});

function validateTemplate(template) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(60).required(),
    content: Joi.string().required(),
    status: Joi.string().valid('Default', 'Not_Default').optional(),
  });
  return schema.validate(template);
}

const Template = mongoose.model('Template', schema);
exports.Template = Template;
exports.validateTemplate = validateTemplate;
