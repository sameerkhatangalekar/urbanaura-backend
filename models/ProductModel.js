import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: true
    },
    categories: {
        type: [String],
        required: true
    },
    sizes: {
        type: [String],
        required: true
    },
    colors: {
        type: [String],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });


const Product = mongoose.model("product", ProductSchema);
export default Product;
