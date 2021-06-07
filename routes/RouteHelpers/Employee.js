const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

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
    designations: Joi.array()
      .items(
        Joi.object()
          .keys({
            designation: Joi.optional(),
          })
          .required()
      )
      .optional(),
    mobileNumbers: Joi.array()
      .items(
        Joi.object()
          .keys({
            mobileNumber: Joi.optional(),
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
    statuses: Joi.array()
      .items(
        Joi.object()
          .keys({
            status: Joi.optional(),
          })
          .required()
      )
      .optional(),
  });
  return schema.validate(filters);
};

const validateEmployeeUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().allow('').optional(),
    designation: Joi.string().required(),
    status: Joi.string().valid('Active', 'Blocked').required(),
    mobileNumber: Joi.string().required(),
    joiningDate: Joi.date().required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });
  return schema.validate(data);
};

exports.validateFilter = validateFilter;
exports.validateEmployeeUpdate = validateEmployeeUpdate;