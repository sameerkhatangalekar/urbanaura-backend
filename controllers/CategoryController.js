import createHttpError from "http-errors";
import Category from "../models/CategoryModel.js";
import { createCategoryValidator, updateCategoryValidator } from "../validators/CategorySchemaValidations.js";

export default {
    createCategory: async (req, res, next) => {
        try {
            const validated = await createCategoryValidator.validateAsync(req.body);
            const doesExists = await Category.findOne({ name: validated.name });
            if (doesExists) throw createHttpError.Conflict("Category with same name already exists");
            const category = new Category(validated);
            await category.save();

            res.status(201).send({
                status: 201,
                message: "Category created"
            })

        } catch (error) {
            next(error)
        }
    },

    updateCategory: async (req, res, next) => {
        try {
            const validated = await updateCategoryValidator.validateAsync(req.body);
            const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
                $set: validated
            })

            if (!updatedCategory) throw createHttpError.NotFound('Category not found');

            res.status(202).send({
                status: 202,
                message: "Information upadted"
            })

        } catch (error) {
            next(error)
        }
    },


    getAllCategories: async (req, res, next) => {
        try {
            const categories = await Category.find({}, { __v: 0, });
            res.send(categories);
        } catch (error) {
            next(error)
        }
    }
}