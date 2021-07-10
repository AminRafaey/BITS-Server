const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

function validateUserForLogin(user) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    userName: Joi.string().required(),
    password: Joi.string().trim().strict().min(4).max(30).required(),
  })
    .when(Joi.object({ email: Joi.exist() }).unknown(), {
      then: Joi.object({
        userName: Joi.optional(),
      }),
    })
    .when(Joi.object({ userName: Joi.exist() }).unknown(), {
      then: Joi.object({
        email: Joi.optional(),
      }),
    });
  return schema.validate(user);
}

function validateEmployeeAccount(user) {
  const schema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().trim().strict().min(4).max(30).required(),
  });
  return schema.validate(user);
}

function validateEmail(user) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });
  return schema.validate(user);
}

function validatePasswordConfirmation(user) {
  const schema = Joi.object({
    password: Joi.string().trim().strict().min(4).max(30).required(),
    confirmPassword: Joi.string().required(),
  });
  return schema.validate(user);
}

exports.validateUserForLogin = validateUserForLogin;
exports.validateEmployeeAccount = validateEmployeeAccount;
exports.validateEmail = validateEmail;
exports.validatePasswordConfirmation = validatePasswordConfirmation;
