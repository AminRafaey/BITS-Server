const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateObjectId = (id) => {
  const schema = Joi.object({
    _id: Joi.objectId().required(),
  });
  return schema.validate(id);
};

exports.validateObjectId = validateObjectId;
