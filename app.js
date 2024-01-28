import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import { connectToDatabase } from './Helpers/initMongodb.js';
import AuthRoute from './routes/AuthRoute.js';
import UserRoute from './routes/UserRoute.js';
import CategoryRoute from './routes/CategoryRoute.js';
import ProductRoute from './routes/ProductRoute.js';
import CartRoute from './routes/CartRoute.js';
import CheckoutRoute from './routes/CheckoutRoute.js';
import OrderRoute from './routes/OrderRoute.js';
import createHttpError from 'http-errors';
import cookieParser from 'cookie-parser';
import { v4 } from 'uuid';
import { limiter } from './helpers/rateLimit.js';
import Stripe from 'stripe';
import User from './models/UserModel.js';
import Order from './models/OrderModel.js';
import Cart from './models/CartModel.js';
import mongoose from 'mongoose';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
connectToDatabase();
const app = express();


app.use(morgan("dev", {
    skip: (req, res) => {
        return res.statusCode < 400;
    }
}))
app.use(
    cors({
        origin: 'http://localhost:5173',  // Replace with the actual origin of your frontend
        credentials: true,
    })
);

app.use("/webhook", express.raw({ type: "*/*" }));

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.ENDPOINT_SECRET
            );
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }


        switch (event.type) {
            case "checkout.session.completed":
                const checkoutSessionCompleted = event.data.object;
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const day = currentDate.getDate();
                const hour = currentDate.getHours();
                const minute = currentDate.getMinutes();
                const second = currentDate.getSeconds();
                const milliseconds = currentDate.getMilliseconds();
                const uniqueId = v4().substring(0, 8);
                const numericUuid = uniqueId
                    .split("-")
                    .map((hex) => parseInt(hex, 16))
                    .join("");
                const orderId = `${year}${month}${day}-${hour}${minute}${second}-${milliseconds}-${numericUuid}`;
                const user = await User.findById(checkoutSessionCompleted.client_reference_id);

                const cart = await Cart.aggregate([
                    {
                        $match: {
                            _id: new mongoose.Types.ObjectId(checkoutSessionCompleted.client_reference_id),
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


                const order = new Order();
                order.user.userId = user._id;
                order.user.email = user.email;
                order.products = cart[0].products;
                order.totalAmount = (checkoutSessionCompleted.amount_total / 100)
                order.shipping = checkoutSessionCompleted.customer_details.address;
                order.orderId = orderId
                await order.save();
                await Cart.findByIdAndDelete(checkoutSessionCompleted.client_reference_id);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.send().end();
    }
);

app.use(express.json())

app.use(cookieParser())
app.use(limiter)
app.get('/health', async (req, res, next) => {
    res.send("🚀🚀 I'm flyingg!!! 🚀🚀");
});

app.use('/api/v1/auth', AuthRoute)
app.use('/api/v1/user', UserRoute)
app.use('/api/v1/category', CategoryRoute)
app.use('/api/v1/product', ProductRoute)
app.use('/api/v1/cart', CartRoute)
app.use('/api/v1/order', OrderRoute)
app.use('/api/v1/checkout', CheckoutRoute)
app.use(async (req, res, next) => {
    next(createHttpError.NotFound("This route does not exists"));
});

app.use((err, req, res, next) => {
    if (err.isJoi) {
        res.status(422).send({
            error: {
                status: 422,
                message: err.message,
                timestamp: new Date().toISOString()
            },
        });
    }
    else {
        console.error(err.stack);
        res.status(err.status).send({
            status: err.status,
            message: err.message,
            timestamp: new Date().toISOString()
            ,
        });
        // res.status(500);
        // res.send({
        //     error: {
        //         status: 500,
        //         message: 'Internal Server Error',
        //     },
        // });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
