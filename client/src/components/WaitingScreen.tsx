import { useRoom } from "../context/RoomContext.js"

const WaitingScreen = () => {
    const { userName, roomId } = useRoom()

    return (
        <div className="flex h-screen w-screen justify-center items-center">
            <div className="flex flex-col items-center gap-6">
                <h1 className="text-2xl font-semibold">Hi {userName}, waiting for someone to join...</h1>
                
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                
                <p className="text-gray-500 text-sm">Room ID: {roomId}</p>
            </div>
        </div>
    )
}

export default WaitingScreen