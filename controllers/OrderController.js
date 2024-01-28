import Order from '../models/OrderModel.js';

export default {

    updateOrder: async (req, res, next) => {
        try {
            const updatedOrder = await Order.findOneAndUpdate({ "user.userId": req.user._id }, {
                $set: req.body
            }, { new: true })
            res.status(202).json({
                status: 202,
                message: "Order updated"
            });
        } catch (error) {
            next(error)
        }
    },



    getOrderById: async (req, res, next) => {
        try {
            const order = await Order.findById(req.params.id);
            res.json(order);
        } catch (error) {
            next(error)
        }
    },
    getMyOrders: async (req, res, next) => {
        try {
            const orders = await Order.find({ "user.userId": req.user._id }).populate("products.product", 'title images');
            res.json(orders);
        } catch (error) {
            next(error)
        }
    }
}