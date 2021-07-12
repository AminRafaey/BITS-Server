const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
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
  });
  return schema.validate(template);
}

const Template = mongoose.model('Template', schema);
exports.Template = Template;
exports.validateTemplate = validateTemplate;
