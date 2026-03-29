import mongoose from "mongoose"
const Schema = mongoose.Schema

export interface IUser {
    socketId: string,
    name: string
}

export interface IRoom {
    roomId: string,
    users: IUser[],
    isFull: boolean,
    createdAt: Date
}

const roomSchema = new Schema<IRoom>({
    roomId: {
        type: String,
        required: true
    },
    users: [
        {
            socketId: {
                type: String
            },
            name: {
                type: String
            }
        }
    ],
    isFull: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

const roomModel = mongoose.model<IRoom>("Rooms", roomSchema)

export default roomModel;