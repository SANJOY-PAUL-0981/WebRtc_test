import roomModel from "../models/room.js"

export const findFreeRoom = async () => {
    const room = await roomModel.findOne({ isFull: false })
    return room
}

export const createRoom = async () => {
    const roomId = crypto.randomUUID()
    const room = await roomModel.create({
        roomId,
        users: [],
        isFull: false
    })
    return room
}

export const addUserToRoom = async (roomId: string, socketId: string, name: string) => {
    const room = await roomModel.findOneAndUpdate(
        { roomId },
        {
            $push: {
                users: {
                    socketId,
                    name
                }
            }
        },
        { new: true }
    )

    if (room && room.users.length === 2) {
        await roomModel.findOneAndUpdate(
            { roomId },
            { isFull: true },
            { new: true }
        )
    }

    return room
}

export const removeUserFromRoom = async (socketId: string) => {
    const room = await roomModel.findOne(
        { 'users.socketId': socketId }
    )

    const peer = room?.users.find(user => user.socketId !== socketId)

    const updatedRoom = await roomModel.findOneAndUpdate(
        { 'users.socketId': socketId },
        {
            $pull: {
                users: {
                    socketId
                },
            },
            $set: {
                isFull: false
            }
        },
        { new: true }
    )

    return { room: updatedRoom, peer }
}

export const getRoomPeer = async (socketId: string) => {
    const room = await roomModel.findOne(
        { 'users.socketId': socketId }
    )

    const peer = room?.users.find(user => user.socketId !== socketId)

    return peer
}

export const deleteEmptyRoom = async (roomId: string) => {
    await roomModel.deleteOne(
        {
            roomId,
            users: {
                $size: 0
            }
        }
    )
}