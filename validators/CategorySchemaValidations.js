import joi from "joi";

const createCategoryValidator = joi.object({
    name: joi.string().required().messages({
        'any.required': 'Name is required'
    }),
    image: joi.string().required().messages({
        'any.required': 'Image is required'
    }),
})

const updateCategoryValidator = joi.object({
    name: joi.string().messages({
        'any.required': 'Name is required'
    }),
    image: joi.string().messages({
        'any.required': 'Image is required'
    }),
})
export {
    createCategoryValidator,
    updateCategoryValidator
}