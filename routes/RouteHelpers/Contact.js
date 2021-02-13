const Joi = require('joi');

const validateContactUpdate = (contact) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(30).optional(),
  });
  return schema.validate(contact);
};

exports.validateContactUpdate = validateContactUpdate;
