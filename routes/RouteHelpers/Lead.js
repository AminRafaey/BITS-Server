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

function validateCSVLeads(lead) {
  const schema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().allow('').optional(),
    leadSource: Joi.string().allow('').optional(),
    companyName: Joi.string().allow('').optional(),
    label: Joi.string().allow('').optional(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .allow('')
      .optional(),
    phone: Joi.string().allow('').optional(),
    website: Joi.string().allow('').optional(),
    address: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    zip: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    notes: Joi.array()
      .items(
        Joi.object()
          .keys({
            content: Joi.string().required(),
            _id: Joi.string().optional(),
            editedAt: Joi.string().optional(),
            createdAt: Joi.string().optional(),
          })
          .optional()
      )
      .optional(),
  });
  return schema.validate(lead);
}

exports.isEmailValid = isEmailValid;
exports.isUrlValid = isUrlValid;
exports.validateContent = validateContent;
exports.validateFilter = validateFilter;
exports.validateCSVLeads = validateCSVLeads;
