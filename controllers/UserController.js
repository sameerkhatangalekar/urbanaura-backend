import User from "../models/UserModel.js";
import createHttpError from "http-errors";
import { updateUserSchemaValidator } from "../validators/UserSchemaValidation.js"

export default {
    getLoggedInUser: async (req, res, next) => {
        delete req.user._id;
        delete req.user.roles;
        res.send(req.user);
    },

    getAllUsers: async (req, res, next) => {
        try {
            let page = Number(req.query.page) || 1;
            let limit = Number(req.query.limit) || 1;

            if (page <= 0) {
                page = 1;
            }

            if (limit <= 0 || limit > 100) {
                limit = 10;
            }
            const skip = (page - 1) * limit;
            const users = await User.find({}, { password: 0, __v: 0 }).sort({
                "createdAt": -1
            }).skip(skip).limit(limit).lean();
            res.send(users);
        } catch (error) {
            next(error);
        }
    },
    updateUser: async (req, res, next) => {
        try {
            const validated = await updateUserSchemaValidator.validateAsync(req.body)
            const savedUser = await User.findByIdAndUpdate(
                { _id: req.user._id },
                {
                    $set: validated,
                }
            ).lean();
            if (!savedUser) throw createHttpError.NotFound(`User not found`);
            res.status(202).json({
                status: 202,
                message: "Information updated",
            });
        } catch (error) {
            next(error);
        }
    },

    deleteOwnAccount: async (req, res, next) => {
        try {

            await User.findByIdAndDelete(req.user._id)
            res.status(202).json({
                status: 202,
                message: "Account deleted",
            });
        } catch (error) {
            next(error);
        }
    },

    deleteAccount: async (req, res, next) => {
        try {

            const user = await User.findById(req.params.id);
            if (!user) throw createHttpError.NotFound("User not found")
            await User.findByIdAndDelete(req.params.id)
            res.status(202).json({
                status: 202,
                message: "Account deleted",
            });
        } catch (error) {
            next(error);
        }
    },
}