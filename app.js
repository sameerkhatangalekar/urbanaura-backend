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
import createHttpError from 'http-errors';
import cookieParser from 'cookie-parser';

import { limiter } from './helpers/rateLimit.js';
import Stripe from 'stripe';
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
        origin: "*",
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

        console.log(event)
        switch (event.type) {
            case "payment_intent.created":
                const paymentIntentCreated = event.data.object;
                console.log(`Payment Intent Created ${paymentIntentCreated["id"]}`);
                break;

            case "payment_intent.succeeded":

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
