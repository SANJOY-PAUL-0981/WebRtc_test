import type { Server } from "socket.io";
import { getRoomPeer } from "../utils/roomUtils.js";

const singalHandler = (io: Server) => {
    io.on('connection', (socket) => {
        socket.on('signal', async ({ signal }) => {
            try {
                const peer = await getRoomPeer(socket.id)
                if (peer) {
                    io.to(peer.socketId).emit('signal', { signal })
                }
            } catch (err) {
                console.error(err)
            }
        })
    })
}

export default singalHandler