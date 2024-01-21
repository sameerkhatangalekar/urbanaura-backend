import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    products: [{
        productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
        quantity: {
            type: Number,
            default: 1
        },
        size: {
            type: String,
            required: true
        }
    }],
}, { timestamps: true });


const Cart = mongoose.model("cart", CartSchema);
export default Cart;
