import { Socket, type Server } from "socket.io";
import {
    findFreeRoom,
    createRoom,
    addUserToRoom,
    removeUserFromRoom,
    deleteEmptyRoom
} from "../utils/roomUtils.js";

const roomHandler = (io: Server) => {
    io.on('connection', (socket) => {
        socket.on('join', async ({ name }) => {
            try {
                let room = await findFreeRoom()
                if (!room) {
                    room = await createRoom()
                }

                const roomId = room.roomId
                const updatedRoom = await addUserToRoom(roomId, socket.id, name)
                socket.join(roomId)

                if (updatedRoom && updatedRoom.users.length === 1) {
                    socket.emit('waiting', { roomId })
                }

                if (updatedRoom && updatedRoom.users.length === 2) {
                    io.to(roomId).emit('peer-joined', {
                        roomId,
                        initiator: updatedRoom.users[0]?.socketId
                    })
                }
            } catch (err) {
                console.error(err)
            }
        })

        socket.on('disconnect', async () => {
            try {
                const updatedRoom = await removeUserFromRoom(socket.id)
                const peer = updatedRoom?.peer
                const room = updatedRoom?.room

                if (peer) {
                    io.to(peer.socketId).emit('peer-left')
                }

                if (room) {
                    await deleteEmptyRoom(room.roomId)
                }
            } catch (err) {
                console.error(err)
            }
        })
    })
}

export default roomHandler 