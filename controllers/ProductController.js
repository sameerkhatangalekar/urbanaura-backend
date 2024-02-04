import Product from "../models/ProductModel.js";
import createHttpError from "http-errors";
import { createProductValidator, updateProductValidator } from "../validators/ProductSchemaValidations.js";


export default {
    createProduct: async (req, res, next) => {
        try {
            const validated = await createProductValidator.validateAsync(req.body);
            const doesExists = await Product.findOne({ title: validated.title });
            if (doesExists) throw createHttpError.Conflict("Product with same name already exists")
            const product = new Product(validated);

            await product.save();

            res.status(201).send({
                status: 201,
                message: "Product created successfully"
            })

        } catch (error) {
            next(error)
        }
    },

    updateProduct: async (req, res, next) => {
        try {
            const validated = await updateProductValidator.validateAsync(req.body);
            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
                $set: validated
            }).lean();

            if (!updatedProduct) throw createHttpError.NotFound("Product not found");
            res.status(202).json({
                status: 202,
                message: "Information updated",
            });

        } catch (error) {

            next(error)
        }
    },

    deleteProduct: async (req, res, next) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) throw createHttpError.NotFound("Product not found")
            await Product.findByIdAndDelete(req.params.id)
            res.status(202).json({
                status: 202,
                message: "Product deleted",
            });
        } catch (error) {
            next(error);
        }
    },

    getProduct: async (req, res, next) => {
        try {

            const product = await Product.findOne({ _id: req.params.id });
            if (!product) throw createHttpError.NotFound('Product not found');
            res.send(product);

        } catch (error) {
            next(error)
        }
    },

    getAllProducts: async (req, res, next) => {
        try {
            const query = {
                isActive: true

            };
            if (req.query.category) {
                query.categories = req.query.category;
            }

            if (req.query.color !== '' && req.query.color !== undefined && req.query.color !== null) {
                query.colors = {
                    $regex: req.query.color,
                    $options: 'i'
                };
            }

            if (req.query.size !== '' && req.query.size !== undefined && req.query.size !== null) {
                query.sizes = req.query.size;
            }

            const products = await Product.find(query, { isActive: 0 }).sort({ createdAt: -1 }).populate('categories', 'name')
            res.send(products)

        } catch (error) {
            next(error)
        }
    }
}