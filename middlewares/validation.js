const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

// Custom URL validation function
const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

// Validate clothing item body
module.exports.validateCardBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),

    imageUrl: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "imageUrl" field must be filled in',
      "string.uri": 'the "imageUrl" field must be a valid url',
    }),

    weather: Joi.string().required(),
  }),
});

// Validate user info body (registration)
module.exports.validateUserBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
    }),

    avatar: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "avatar" field must be filled in',
      "string.uri": 'the "avatar" field must be a valid url',
    }),

    email: Joi.string().required().email().messages({
      "string.email": 'The "email" field must be a valid email',
      "string.empty": 'The "email" field must be filled in',
    }),

    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in',
    }),
  }),
});

// Validate login body
module.exports.validateLoginBody = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.email": 'The "email" field must be a valid email',
      "string.empty": 'The "email" field must be filled in',
    }),

    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in',
    }),
  }),
});

// Validate ID parameters (24-character hexadecimal)
module.exports.validateIdParam = celebrate({
  params: Joi.object().keys({
    itemId: Joi.string().required().length(24).hex().messages({
      "string.length": 'The "itemId" must be a valid ID',
      "string.hex": 'The "itemId" must be a valid ID',
    }),
  }),
});

// Generic ID validation for parameters
module.exports.validateId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex().messages({
      "string.length": 'The "id" must be a valid ID',
      "string.hex": 'The "id" must be a valid ID',
    }),
  }),
});
