import http from "http";
import express from 'express';
import { Server } from 'socket.io';
import { connectDB } from "./db/connect.js";
import serverConfig from "./config/server.config.js";
import roomHandler from "./socket/roomHandler.js";
import singalHandler from "./socket/signalHandler.js";

connectDB()

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

roomHandler(io)
singalHandler(io)

server.listen(serverConfig.PORT, () => {
    console.log(`listening on http://localhost:${serverConfig.PORT}`)
})