const Joi = require('joi');

const validateTemplateUpdate = (template) => {
  const schema = Joi.object({
    _id: Joi.objectId().required(),
    title: Joi.string().optional(),
    content: Joi.string().optional(),
  });
  return schema.validate(template);
};

exports.validateTemplateUpdate = validateTemplateUpdate;
