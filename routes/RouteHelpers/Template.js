const Joi = require('joi');

const validateTemplateUpdate = (template) => {
  const schema = Joi.object({
    content: Joi.string().optional(),
    status: Joi.string().valid('Default', 'Not_Default').optional(),
  });
  return schema.validate(template);
};

exports.validateTemplateUpdate = validateTemplateUpdate;
