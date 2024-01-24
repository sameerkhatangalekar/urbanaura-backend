import Order from '../models/OrderModel.js';

export default {
    createOrder: async (req, res, next) => {
        try {
            const newOrder = new Order(req.body);
            await newOrder.save();
            res.status(201).json({
                status: 201,
                message: "Order created successfully"
            });
        } catch (error) {
            next(error)
        }
    },
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

    deleteOrder: async (req, res, next) => {
        try {
            await Order.findOneAndDelete({ "user.userId": req.user._id });
            res.status(202).json({
                status: 202,
                message: "Order deleted"
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
            const order = await Order.find({ "user.userId": req.user._id });
            res.json(order);
        } catch (error) {
            next(error)
        }
    }
}