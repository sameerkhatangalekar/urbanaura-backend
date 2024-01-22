import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    image: {
        type: String,
        required: true
    },

}, { timestamps: true });

const Category = mongoose.model('category', CategorySchema);
export default Category;