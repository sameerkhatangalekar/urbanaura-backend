import jwt from 'jsonwebtoken';
import createHttpError from "http-errors";
import User from "../models/UserModel.js";
const signAccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret = process.env.ACCESS_TOKEN_SECRET;
        const options = {
            expiresIn: "8h",
            issuer: "urbanaura.com",
            audience: userId,
        };

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.log(err.message);
                reject(createHttpError.InternalServerError());
            }
            resolve(token);
        });
    });
}

const verifyAccessToken = async (req, res, next) => {
    if (!req.cookies.accessToken) return next(createHttpError.Unauthorized());
    // const authHeader = req.headers["authorization"];
    // const bearerToken = authHeader.split(" ");
    const token = req.cookies.accessToken;

    // if (!req.headers["authorization"]) return next(createHttpError.Unauthorized());
    // const authHeader = req.headers["authorization"];
    // const bearerToken = authHeader.split(" ");
    // const token = bearerToken[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
        if (err) {
            const message =
                err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
            return next(createHttpError.Unauthorized(message));
        }
        req.user = await User.findOne({ _id: payload.aud }, { password: 0, __v: 0 }).lean();
        if (!req.user) return next(createHttpError.Unauthorized("Unauthorized"));
        delete req.user.password;

        next();
    });
}

const isAdmin = (req, res, next) => {
    if (!req.user.roles.includes("admin")) {
        return next(createHttpError.Forbidden());
    }
    next();
}
export {
    signAccessToken,
    verifyAccessToken,
    isAdmin
}