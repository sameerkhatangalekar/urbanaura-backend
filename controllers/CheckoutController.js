import Stripe from 'stripe';
import Cart from '../models/CartModel.js';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


export default {
    config: async (req, res, next) => {
        res.send({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    },
    createCheckout: async (req, res, next) => {
        const cart = await Cart.aggregate([
            {
                $match: {
                    _id: req.user._id,
                },
            },
            {
                $unwind: "$products",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "products.product",
                },
            },
            {
                $unwind: "$products.product",
            },

            {
                $addFields: {
                    "products.itemAmount": {
                        $sum: {
                            $multiply: [
                                "$products.quantity",
                                "$products.product.price"
                            ],
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$_id",
                    products: {
                        $push: "$products",
                    },
                    cartTotalAmount: {
                        $sum: "$products.itemAmount",
                    },
                },
            },
            {
                $project: {
                    "products.product.description": 0,
                    "products.product.isActive": 0,
                    "products.product.createdAt": 0,
                    "products.product.updatedAt": 0,
                    "products.product.categories": 0,
                    "products.product.__v": 0,
                    "products.product.sizes": 0,
                    "products.product.colors": 0,
                },
            }

        ]);

        let lineItems = [];
        cart[0].products.map((item) => {
            const lineItem = {
                price_data: {
                    currency: 'INR',
                    product_data: {
                        name: item.product.title,
                        images: item.product.images
                    },
                    unit_amount: (item.product.price * 100)

                },
                quantity: item.quantity,
            }
            lineItems.push(lineItem)
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${process.env.CLIENT_URL}success`,
            cancel_url: `${process.env.CLIENT_URL}cart`,
            line_items: lineItems,
            currency: 'INR',
            metadata: {
                'userId': req.user._id.toString()
            },
            mode: 'payment',
            customer_email: req.user.email,
            client_reference_id: req.user._id.toString(),
            billing_address_collection: 'required'
        })

        res.send({
            url: session.url,
        });
    },
}