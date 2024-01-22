import joi from "joi";

const loginInformationValidator = joi.object({
    email: joi.string().email().lowercase().required().messages({
        'any.required': "Email is required",
    }),
    password: joi.string().min(4).max(12).required().messages({
        'any.required': "Password is required",
        'string.max': "Max password length exceeded",
        'string.min': "Min password length is 4",
    }),
});



const registerUserValidator = joi.object({
    firstName: joi.string().required().messages({
        'any.required': "First name is required",
    }),
    lastName: joi.string().required().messages({
        'any.required': "Last name is required",
    }),
    email: joi.string().email().lowercase().required().messages({
        'any.required': "Email is required",
    }),
    password: joi.string().min(4).max(12).required().messages({
        'any.required': "Password is required",
        'string.max': "Max password length exceeded",
        'string.min': "Min password length is 4",
    }),
    contact: joi.string().required().min(10).max(10).messages({
        'any.required': "Contact is required",
        'string.max': "Provide valid contact",
        'string.min': "Provide valid contact",
    }),
});

export {
    loginInformationValidator,
    registerUserValidator
} 