const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateContent = (data) => {
  const schema = Joi.object({
    content: Joi.string().required(),
  });
  return schema.validate(data);
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
