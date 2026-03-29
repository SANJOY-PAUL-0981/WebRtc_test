import dotenv from "dotenv"
dotenv.config()

const serverConfig = {
    PORT: process.env.PORT || 3000,
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/webrtc'
}

export default serverConfig;