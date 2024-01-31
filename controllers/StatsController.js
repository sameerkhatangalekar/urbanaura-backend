import Order from "../models/OrderModel.js";
import User from "../models/UserModel.js";
export default {

    getTotalStats: async (req, res, next) => {
        try {
            const orderCount = await Order.find().countDocuments();
            const userCount = await User.find().countDocuments();
            const totalSales = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: '$totalAmount' }
                    }
                }

            ])

            if (totalSales.length > 0) {
                res.send({
                    totalSales: totalSales[0].totalSales,
                    userCount,
                    orderCount
                })
            }
            else {
                res.send({
                    totalSales: 0,
                    userCount,
                    orderCount
                })
            }


        } catch (error) {
            next(error)
        }
    },


    getOrderCountsByMonth: async (req, res, next) => {
        try {
            const date = new Date();
            const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
            const data = await Order.aggregate([
                { $match: { createdAt: { $gte: lastYear } } },
                {
                    $project: {
                        month: { $month: "$createdAt" },
                    },
                },
                {
                    $group: {
                        _id: "$month",
                        total: { $sum: 1 },
                    },
                },
            ]);
            res.status(200).json(data)
        } catch (error) {
            next(error)
        }
    },


    getRecentWeekOrders: async (req, res, next) => {
        try {
            const date = new Date();
            date.setDate((date.getDate() - 7))

            const data = await Order.find(
                {
                    createdAt: { $gte: date }
                },
                {
                    __v: 0,
                    products: 0,
                    shipping: 0,
                    updatedAt: 0
                }
            );
            res.status(200).json(data)

        } catch (error) {
            next(error)
        }
    },

    getRecentWeekUsers: async (req, res, next) => {
        try {
            const date = new Date();
            date.setDate(date.getDate() - 7);
            const users = await User.find({
                // createdAt: {
                //     $gte: date
                // }
            }, {
                verifyToken: 0,
                password: 0,
                roles: 0,
                updatedAt: 0,
                __v: 0
            })
            res.send(users);
        } catch (error) {
            next(error);
        }
    },

}