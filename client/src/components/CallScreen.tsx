import { useRef, useEffect } from "react"
import { useRoom } from "../context/RoomContext.js"
import { useMedia } from "../hooks/useMedia.js"
import { useSocket } from "../hooks/useSocket.js"
import { useMask } from "../hooks/useMask.js"

const CallScreen = ({ initConnection, closeConnection, swapStream }: {
    initConnection: (stream: MediaStream) => void
    closeConnection: () => void
    swapStream: (stream: MediaStream) => void
}) => {
    const { localStream, remoteStream, setCallStatus } = useRoom()
    const { toggleMute, toggleCamera, stopMedia, isMuted, isCameraOff } = useMedia()
    const { emitLeave } = useSocket()
    const { getMaskedStream, maskActive, maskReady, canvasRef, setupThreeJS, setupFaceMesh, setupHands } = useMask()


    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            setupThreeJS(640, 480, localVideoRef.current)
            setupFaceMesh(localVideoRef.current)
            setupHands(localVideoRef.current)
        }
    }, [localStream])

    useEffect(() => {
        if (maskActive) {
            const maskedStream = getMaskedStream(localStream!)
            if (maskedStream) swapStream(maskedStream)
        } else {
            if (localStream) swapStream(localStream)
        }
    }, [maskActive])

    useEffect(() => {
        if (maskReady && canvasRef.current && localVideoRef.current) {
            canvasRef.current.style.position = 'absolute'
            canvasRef.current.style.width = '33%'
            localVideoRef.current.parentElement?.appendChild(canvasRef.current)
        }
    }, [maskReady])

    useEffect(() => {
        if (localStream) {
            initConnection(localStream)
        }
    }, [])

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
            <div className="relative w-1/3">
                <video ref={localVideoRef} autoPlay playsInline className="w-full rounded-xl" />
            </div>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-1/3 rounded-xl" />

            <div className="absolute bottom-6 flex gap-4">
                <button onClick={toggleMute} className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                    {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button onClick={toggleCamera} className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                    {isCameraOff ? 'Camera On' : 'Camera Off'}
                </button>
                <button onClick={handleLeave} className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Leave
                </button>
            </div>
            <div className="absolute top-4 right-4 text-white text-sm">
                {maskActive ? '🕷️ Mask ON' : 'Mask OFF'}
            </div>
        </div>
    )
}

export default CallScreen