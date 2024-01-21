import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        unique: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    images: {
        type: [String],
        required: true
    },
    categories: {
        type: [String],
        required: true
    },
    size: {
        type: [String],
        required: true
    },
    price: {
        tpye: Number,
        required: true
    }
}, { timestamps: true });


const Product = mongoose.model("product", ProductSchema);
export default Product;
