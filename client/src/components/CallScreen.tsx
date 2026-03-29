import { useRef, useEffect } from "react"
import { useRoom } from "../context/RoomContext.js"
import { useMedia } from "../hooks/useMedia.js"
import { useWebRTC } from "../hooks/useWebRTC.js"
import { useSocket } from "../hooks/useSocket.js"

const CallScreen = () => {
    const { localStream, remoteStream, setCallStatus } = useRoom()
    const { toggleMute, toggleCamera, stopMedia, isMuted, isCameraOff } = useMedia()
    const { closeConnection } = useWebRTC()
    const { emitLeave } = useSocket()

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    const handleLeave = () => {
        closeConnection()
        stopMedia()
        emitLeave()
        setCallStatus('idle')
    }

    return (
        <div className="flex h-screen w-screen bg-black justify-center items-center gap-4">
            <video ref={localVideoRef} autoPlay playsInline className="w-1/3 rounded-xl" />
            <video ref={remoteVideoRef} autoPlay playsInline  className="w-1/3 rounded-xl" />

            <div className="absolute bottom-6 flex gap-4">
                <button
                    onClick={toggleMute}
                    className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                    {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                    onClick={toggleCamera}
                    className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                    {isCameraOff ? 'Camera On' : 'Camera Off'}
                </button>
                <button
                    onClick={handleLeave}
                    className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Leave
                </button>
            </div>
        </div>
    )
}

export default CallScreen