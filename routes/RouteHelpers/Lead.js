const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateContent = (data) => {
  const schema = Joi.object({
    content: Joi.string().required(),
  });
  return schema.validate(data);
};

const validateFilter = (filters) => {
  const schema = Joi.object({
    firstName: Joi.array()
      .items(
        Joi.object()
          .keys({
            firstName: Joi.optional(),
          })
          .required()
      )
      .required(),

    leadSource: Joi.array()
      .items(
        Joi.object()
          .keys({
            leadSource: Joi.optional(),
          })
          .required()
      )
      .required(),
    companyName: Joi.array()
      .items(
        Joi.object()
          .keys({
            companyName: Joi.optional(),
          })
          .required()
      )
      .required(),
    labels: Joi.array()
      .items(
        Joi.object()
          .keys({
            labels: Joi.optional(),
          })
          .required()
      )
      .required(),
    email: Joi.array()
      .items(
        Joi.object()
          .keys({
            email: Joi.optional(),
          })
          .required()
      )
      .required(),
    phone: Joi.array()
      .items(
        Joi.object()
          .keys({
            phone: Joi.optional(),
          })
          .required()
      )
      .required(),

    city: Joi.array()
      .items(
        Joi.object()
          .keys({
            city: Joi.optional(),
          })
          .required()
      )
      .required(),
    state: Joi.array()
      .items(
        Joi.object()
          .keys({
            state: Joi.optional(),
          })
          .required()
      )
      .required(),
    zip: Joi.array()
      .items(
        Joi.object()
          .keys({
            zip: Joi.optional(),
          })
          .required()
      )
      .required(),
    country: Joi.array()
      .items(
        Joi.object()
          .keys({
            country: Joi.optional(),
          })
          .required()
      )
      .required(),
  });
  return schema.validate(filters);
};

function isEmailValid(email) {
  if (email) {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      email
    );
  }
}

function isUrlValid(url) {
  if (url) {
    return /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(
      url
    );
  }
}

exports.isEmailValid = isEmailValid;
exports.isUrlValid = isUrlValid;
exports.validateContent = validateContent;
exports.validateFilter = validateFilter;
