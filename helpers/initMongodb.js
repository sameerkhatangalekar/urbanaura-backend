import mongoose from "mongoose"

mongoose.set("strictQuery", true);

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("Database Connected");


        mongoose.connection.on("connected", () => {
            console.log("Mongoose connected to database");
        });

        mongoose.connection.on("error", (err) => {
            console.log(err.message);
        });

        mongoose.connection.on("disconnected", (err) => {
            console.log("Mongoose connection is disconnected");
        });

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    } catch (error) {
        console.log(error)
    }
}