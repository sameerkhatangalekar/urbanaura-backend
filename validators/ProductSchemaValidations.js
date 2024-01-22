import joi from "joi";
const createProductValidator = joi.object({
    title: joi.string().required().messages({
        'any.required': "Product title is required",
    }),
    description: joi.string().required().messages({
        'any.required': "Last name is required",
    }),
    images: joi.array().items(joi.string()).required().messages({
        'any.required': "Atleast one image is required",
    }),
    categories: joi.array().items(joi.string()).required().messages({
        'any.required': "Atleast one category is required",
    }),
    sizes: joi.array().items(joi.string()).required().messages({
        'any.required': "Atleast one size is required",
    }),
    price: joi.number().min(1).required().messages({
        'any.required': "Price is required",
        'number.min': "Minimum price must be 1"
    }),
});

const updateProductValidator = joi.object({
    title: joi.string().messages({
        'any.required': "Product title is required",
    }),
    description: joi.string().messages({
        'any.required': "Last name is required",
    }),
    images: joi.array().items(joi.string()).messages({
        'any.required': "Atleast one image is required",
    }),
    categories: joi.array().items(joi.string()).messages({
        'any.required': "Atleast one category is required",
    }),
    sizes: joi.array().items(joi.string()).messages({
        'any.required': "Atleast one size is required",
    }),

    colors: joi.array().items(joi.string()).messages({
        'any.required': "Atleast one color is required",
    }),
    price: joi.number().min(1).messages({
        'any.required': "Price is required",
        'number.min': "Minimum price must be 1"
    }),
});
export {
    createProductValidator,
    updateProductValidator
}