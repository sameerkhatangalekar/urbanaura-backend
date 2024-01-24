import Cart from "../models/CartModel.js";
export default {
    createCart: async (req, res, next) => {
        try {
            const newCart = new Cart(req.body);
            await newCart.save();
            res.status(201).json({
                status: 201,
                message: "Cart created successfully"
            });
        } catch (error) {
            next(error)
        }
    },
    updateCart: async (req, res, next) => {
        try {
            const updatedCart = await Cart.findOneAndUpdate({ userId: req.user._id }, {
                $set: req.body
            }, { new: true })
            res.status(202).json({
                status: 202,
                message: "Cart updated"
            });
        } catch (error) {
            next(error)
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
            const cart = await Cart.findOne({ userId: req.user._id });
            res.json(cart);
        } catch (error) {
            next(error)
        }
    }
}