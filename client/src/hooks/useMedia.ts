import { useState } from "react"
import { useRoom } from "../context/RoomContext"

export const useMedia = () => {
    const { localStream, setLocalStream } = useRoom()
    const [isMuted, setIsMuted] = useState<boolean>(false)
    const [isCameraOff, setIsCameraOff] = useState<boolean>(false)
    const [permissionError, setPermissionError] = useState<boolean>(false)

    const getMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            setLocalStream(stream)
        } catch (err) {
            setPermissionError(true)
        }
    }

    const toggleMute = () => {
        if (!localStream) return
        localStream.getAudioTracks()[0].enabled = !isMuted
        setIsMuted(!isMuted)
    }

    const toggleCamera = () => {
        if (!localStream) return
        localStream.getVideoTracks()[0].enabled = !isCameraOff
        setIsCameraOff(!isCameraOff)
    }

    const stopMedia = () => {
        if (!localStream) return
        localStream.getTracks().forEach(t => t.stop())
        setLocalStream(null)
    }

    return {
        localStream,
        isMuted,
        isCameraOff,
        permissionError,
        getMedia,
        toggleMute,
        toggleCamera,
        stopMedia
    }
}