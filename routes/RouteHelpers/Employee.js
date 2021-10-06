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
    firstName: Joi.string().optional(),
    lastName: Joi.string().allow('').optional(),
    designation: Joi.string().optional(),
    status: Joi.string().valid('Active', 'Blocked', 'Not-Verified').optional(),
    mobileNumber: Joi.string().optional(),
    joiningDate: Joi.date().optional(),
  });
  return schema.validate(data);
};

const validateEmployeeAccessUpdate = (data) => {
  const schema = Joi.object({
    _id: Joi.objectId().required(),
    adminId: Joi.objectId().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().allow('').optional(),
    designation: Joi.string().required(),
    status: Joi.string().valid('Active', 'Blocked', 'Not-Verified').required(),
    mobileNumber: Joi.string().required(),
    joiningDate: Joi.date().required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().optional(),
    quickSend: Joi.string().valid('allow', 'not-allow').required(),
    contactManagement: Joi.string().valid('allow', 'not-allow').required(),
    templateManagement: Joi.string().valid('allow', 'not-allow').required(),
    labelManagement: Joi.string().valid('allow', 'not-allow').required(),
    inbox: Joi.string().valid('allow', 'not-allow').required(),
    __v: Joi.number().required(),
  });
  return schema.validate(data);
};

const validateEmployeeStatus = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('Active', 'Blocked').required(),
  });
  return schema.validate(data);
};

exports.validateFilter = validateFilter;
exports.validateEmployeeUpdate = validateEmployeeUpdate;
exports.validateEmployeeAccessUpdate = validateEmployeeAccessUpdate;
exports.validateEmployeeStatus = validateEmployeeStatus;
