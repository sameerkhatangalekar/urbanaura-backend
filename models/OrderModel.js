import mongoose from "mongoose";
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        email: { type: String, required: true }
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
    amount: {
        type: Number,
        required: true
    },
    shipping: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }
}, { timestamps: true });


const Order = mongoose.model("order", OrderSchema);
export default Order;
