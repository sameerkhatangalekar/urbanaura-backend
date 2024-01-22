import express from 'express';
import morgan from 'morgan';
import { connectToDatabase } from './Helpers/initMongodb.js';
import AuthRoute from './routes/AuthRoute.js';
import UserRoute from './routes/UserRoute.js';
import CategoryRoute from './routes/CategoryRoute.js';
import ProductRoute from './routes/ProductRoute.js';
import createHttpError from 'http-errors';
import 'dotenv/config';
import { limiter } from './helpers/rateLimit.js';

connectToDatabase();
const app = express();
app.use(express.json())
app.use(morgan("dev", {
    skip: (req, res) => {
        return res.statusCode < 400;
    }
}))
app.use(limiter)


app.get('/health', async (req, res, next) => {
    res.send("🚀🚀 I'm flyingg!!! 🚀🚀");
});

app.use('/api/v1/auth', AuthRoute)
app.use('/api/v1/user', UserRoute)
app.use('/api/v1/category', CategoryRoute)
app.use('/api/v1/product', ProductRoute)
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
            error: {
                status: err.status,
                message: err.message,
                timestamp: new Date().toISOString()
            },
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
