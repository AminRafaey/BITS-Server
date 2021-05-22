const Joi = require('joi');

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

exports.validateUserForLogin = validateUserForLogin;
