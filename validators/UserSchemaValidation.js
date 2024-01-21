import joi from "joi";



const updateUserSchemaValidator = joi.object({
    firstName: joi.string().messages({
        'any.required': "First name is required",
    }),
    lastName: joi.string().messages({
        'any.required': "Last name is required",
    }),
    email: joi.string().email().lowercase().messages({
        'any.required': "Email is required",
    }),

    contact: joi.string().min(10).max(10).messages({
        'string.max': "Provide valid contact",
        'string.min': "Provide valid contact",
    }),
});

export {
    updateUserSchemaValidator,
} 