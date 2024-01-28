import joi from "joi";

const createCartItem = joi.object({
    quantity: joi.number().required(),
    product: joi.string().required(),
    size: joi.string().required(),
    color: joi.string().required(),
});



export {
    createCartItem
}