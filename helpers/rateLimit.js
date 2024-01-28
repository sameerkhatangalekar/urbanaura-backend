import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        status: 409,
        message: "Too many requests, please try again later.",
        timestamp: new Date().toISOString()

    },

})