import Cart from "../models/CartModel.js";
import { createCartItem } from "../validators/CartSchemaValidations.js";
export default {
    createCart: async (req, res, next) => {
        try {
            const validatedCartItem = await createCartItem.validateAsync(req.body);
            const cart = await Cart.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $push: {
                        products: [
                            {
                                quantity: validatedCartItem.quantity,
                                product: validatedCartItem.product,
                                size: validatedCartItem.size,
                                color: validatedCartItem.color,
                            },
                        ],
                    },
                },
                { upsert: true, new: true }
            );

            res.status(201).json({
                success: true,
                message: "Item added to cart",
            });
        } catch (error) {
            if (error.isJoi == true) error.status = 422;
            next(error);
        }
    },


    removeFromCart: async (req, res, next) => {
        try {
            const cart = await Cart.findByIdAndUpdate(
                { _id: req.user._id },
                {
                    $pull: {
                        products: { _id: req.params.id },
                    },
                },
                { new: true }
            );

            if (cart) {
                if (cart.products.length === 0) {
                    await Cart.findByIdAndDelete(cart._id);
                }
                res.status(202).json({
                    status: 202,
                    message: "Item removed",
                });
            } else {
                throw createError.NotFound("Cart is already empty");
            }
        } catch (error) {
            if (error.isJoi == true) error.status = 422;
            next(error);
        }
    },

    updateCartItemCount: async (req, res, next) => {
        try {
            const cart = await Cart.findOneAndUpdate(
                {
                    _id: req.user._id,
                    "products._id": req.params.id,
                },
                {
                    $inc: {
                        "products.$.quantity": req.params.quantity,
                    },
                },
                { new: true }
            );
            if (!cart) throw createError.NotFound("Cart is empty");
            res.json({
                status: true,
                message: "Item quantity updated",
            });
        } catch (error) {
            if (error.isJoi == true) error.status = 422;
            next(error);
        }
    },

    deleteCart: async (req, res, next) => {
        try {
            const updatedCart = await Cart.findOneAndDelete({ userId: req.user._id });
            res.status(202).json({
                status: 202,
                message: "Cart deleted"
            });
        } catch (error) {
            next(error)
        }
    },

    getCart: async (req, res, next) => {
        try {

            const cart = await Cart.aggregate([
                {
                    $match: {
                        _id: req.user._id,
                    },
                },
                {
                    $unwind: "$products",
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "products.product",
                    },
                },
                {
                    $unwind: "$products.product",
                },

                {
                    $addFields: {
                        "products.itemAmount": {
                            $sum: {
                                $multiply: [
                                    "$products.quantity",
                                    "$products.product.price"
                                ],
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: "$_id",
                        products: {
                            $push: "$products",
                        },
                        cartTotalAmount: {
                            $sum: "$products.itemAmount",
                        },
                    },
                },
                {
                    $project: {
                        "products.product.description": 0,
                        "products.product.isActive": 0,
                        "products.product.createdAt": 0,
                        "products.product.updatedAt": 0,
                        "products.product.categories": 0,
                        "products.product.__v": 0,
                        "products.product.sizes": 0,
                        "products.product.colors": 0,
                    },
                }

            ]);

            if (cart.length > 0) {
                return res.send(cart[0])
            }
            else {
                return res.send({
                    products: [],
                    cartQuantity: 0,
                    cartTotalAmount: 0
                })
            }


        } catch (error) {
            if (error.isJoi == true) error.status = 422;
            next(error);
        }
    },
}