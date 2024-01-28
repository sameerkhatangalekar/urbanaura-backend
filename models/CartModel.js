import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    products: [{
        product: { type: Schema.Types.ObjectId, ref: 'product', required: true },
        quantity: {
            type: Number,
            default: 1
        },
        size: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        }
    }],
}, { timestamps: true });


const Cart = mongoose.model("cart", CartSchema);
export default Cart;
