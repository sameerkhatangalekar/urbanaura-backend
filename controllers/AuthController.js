import User from '../models/UserModel.js';
import { registerSchemaValidator, loginSchemaValidator } from '../validators/AuthSchemaValidations.js';
import createHttpError from 'http-errors';
import { signAccessToken, verifyAccessToken } from '../helpers/jwtHelper.js'

export default {
    register: async (req, res, next) => {
        try {
            const validated = await registerSchemaValidator.validateAsync(req.body);
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
            const validated = await loginSchemaValidator.validateAsync(req.body);
            const user = await User.findOne({ email: validated.email });
            if (!user) throw createHttpError.NotFound("User does not exists");

            const isValidPassword = await user.isValidPassword(validated.password);
            if (!isValidPassword) throw createHttpError.BadRequest("Email / Password not valid");

            const accessToken = await signAccessToken(user.id);

            res.send({
                accessToken
            })

        } catch (error) {
            next(error)
        }
    }
};
