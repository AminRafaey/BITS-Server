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
    firstNames: Joi.array()
      .items(
        Joi.object()
          .keys({
            firstName: Joi.optional(),
          })
          .required()
      )
      .optional(),
    lastNames: Joi.array()
      .items(
        Joi.object()
          .keys({
            lastName: Joi.optional(),
          })
          .required()
      )
      .optional(),
    leadSources: Joi.array()
      .items(
        Joi.object()
          .keys({
            leadSource: Joi.optional(),
          })
          .required()
      )
      .optional(),
    companies: Joi.array()
      .items(
        Joi.object()
          .keys({
            companyName: Joi.optional(),
          })
          .required()
      )
      .optional(),
    labels: Joi.array()
      .items(
        Joi.object()
          .keys({
            labels: Joi.optional(),
          })
          .required()
      )
      .optional(),
    emails: Joi.array()
      .items(
        Joi.object()
          .keys({
            email: Joi.optional(),
          })
          .required()
      )
      .optional(),
    phones: Joi.array()
      .items(
        Joi.object()
          .keys({
            phone: Joi.optional(),
          })
          .required()
      )
      .optional(),

    cities: Joi.array()
      .items(
        Joi.object()
          .keys({
            city: Joi.optional(),
          })
          .required()
      )
      .optional(),
    states: Joi.array()
      .items(
        Joi.object()
          .keys({
            state: Joi.optional(),
          })
          .required()
      )
      .optional(),
    zip: Joi.array()
      .items(
        Joi.object()
          .keys({
            zip: Joi.optional(),
          })
          .required()
      )
      .optional(),
    countries: Joi.array()
      .items(
        Joi.object()
          .keys({
            country: Joi.optional(),
          })
          .required()
      )
      .optional(),
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
