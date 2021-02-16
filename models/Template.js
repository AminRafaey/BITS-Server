const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },

  content: {
    type: String,
    required: true,
  },

  mediaType: {
    type: String,
    enum: ['image', 'video', 'pdf'],
  },

  media: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date(),
  },
});

function validateTemplate(template) {
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    mediaType: Joi.string().valid('image', 'video', 'pdf').optional(),
    media: Joi.string().optional(),
  });
  return schema.validate(template);
}

const Template = mongoose.model('Template', schema);
exports.Template = Template;
exports.validateTemplate = validateTemplate;
