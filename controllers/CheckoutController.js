import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


export default {
    config: async (req, res, next) => {
        res.send({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    },
    createCheckout: async (req, res, next) => {
        const session = await stripe.checkout.sessions.create({
            success_url: 'http://localhost:5173/success',
            line_items: [
                {
                    price_data: {
                        currency: 'USD',
                        product_data: {
                            name: 'Bigbanman Tshirt',
                            description: 'Some description',
                            images: ["https://firebasestorage.googleapis.com/v0/b/portfolio-7177e.appspot.com/o/clothing%2Fkurti.jpg?alt=media&token=9fab535e-aa25-4616-8e64-92038f1f694c"]
                        },
                        unit_amount: 1000

                    },
                    quantity: 2,

                }
            ],
            currency: 'USD',
            metadata: {
                'userId': 'Sameer'
            },
            mode: 'payment',
            customer_email: 'noobiestgod@gmail.com',
            client_reference_id: "sameer",
            billing_address_collection: 'required'

        })

        res.send({
            id: session.id,
        });
    },
}