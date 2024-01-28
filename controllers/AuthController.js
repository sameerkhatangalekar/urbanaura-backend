import User from '../models/UserModel.js';
import { registerUserValidator, loginInformationValidator } from '../validators/AuthSchemaValidations.js';
import createHttpError from 'http-errors';
import { signAccessToken, verifyAccessToken } from '../helpers/jwtHelper.js'

export default {
    register: async (req, res, next) => {
        try {
            const validated = await registerUserValidator.validateAsync(req.body);
            const doesExists = await User.findOne({ email: validated.email });
            if (doesExists) throw createHttpError.Conflict(`${validated.email} is already been registered`);
            const user = new User(validated);
            await user.save();
            res.status(201).send({
                status: 201,
                message: "Registered Successfully"
            })
        } catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const validated = await loginInformationValidator.validateAsync(req.body);
            const user = await User.findOne({ email: validated.email });
            if (!user) throw createHttpError.NotFound("User does not exists");

            const isValidPassword = await user.isValidPassword(validated.password);
            if (!isValidPassword) throw createHttpError.BadRequest("Email / Password not valid");

            const accessToken = await signAccessToken(user.id);

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 8 * 60 * 60 * 1000
            })
            res.send({
                accessToken
            })

        } catch (error) {
            next(error)
        }
    },

    logout: async (req, res, next) => {
        try {

            res.clearCookie('accessToken')
            res.status(202).send({
                status: 202,
                message: 'Logged out successfully'
            })

        } catch (error) {
            next(error)
        }
    }
};
