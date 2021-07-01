const Joi = require('joi');

const validateTemplateUpdate = (template) => {
  const schema = Joi.object({
    title: Joi.string().optional(),
    content: Joi.string().optional(),
    status: Joi.string().valid('Default', 'Not_Default').optional(),
    mediaType: Joi.string().valid('image', 'video', 'pdf').optional(),
    media: Joi.string().optional(),
  });
  return schema.validate(template);
};

exports.validateTemplateUpdate = validateTemplateUpdate;
