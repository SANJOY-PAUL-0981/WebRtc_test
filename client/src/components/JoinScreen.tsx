import { useRoom } from "../context/RoomContext"
import { useSocket } from "../hooks/useSocket"
import { useMedia } from "../hooks/useMedia"
import { useState } from "react"

const JoinScreen = () => {
    const [name, setName] = useState("")
    const { setUserName } = useRoom()
    const { emitJoin } = useSocket()
    const { getMedia, permissionError } = useMedia()

    const handleJoin = async () => {
        if (!name) {
            alert("enter name")
            return
        }
        setUserName(name)
        await getMedia()
        emitJoin(name)
    }

    return (
        <div className="flex h-screen w-screen justify-center items-center">
            <div className="gap-5 flex flex-col items-center">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-2 border-black p-2"
                    type="text" />
                {permissionError && <p className="text-red-500">Camera/mic access denied!</p>}
                <button
                    onClick={handleJoin}
                    className="py-1 px-4 bg-blue-500 text-lg cursor-pointer hover:bg-blue-600">Join!</button>
            </div>
        </div>
    )
}

export default JoinScreen