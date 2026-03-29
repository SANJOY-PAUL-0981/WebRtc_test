import mongoose from "mongoose";
import serverConfig from "../config/server.config.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(serverConfig.MONGO_URI)
        console.log("successfully connected with database!")
    } catch(err) {
        console.error(err)
        process.exit(1)
    }
}