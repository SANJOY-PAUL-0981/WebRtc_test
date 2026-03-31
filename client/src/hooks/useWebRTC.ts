import { iceConfig } from "../config/webrtc.config";
import { useSocket } from "./useSocket";
import { useRoom } from "../context/RoomContext";
import { useRef } from "react";
import type { SignalData } from "../types";

export const useWebRTC = () => {
    const pc = useRef<RTCPeerConnection | null>(null)
    const { emitSignal } = useSocket()
    const { setRemoteStream, isInitiator } = useRoom()

    const createOffer = async () => {
        const offer = await pc.current!.createOffer()
        await pc.current!.setLocalDescription(offer)
        emitSignal({ type: 'offer', sdp: offer })
    }

    const initConnection = (localStream: MediaStream) => {
        pc.current = new RTCPeerConnection(iceConfig)

        localStream.getTracks().forEach(track => {
            pc.current!.addTrack(track, localStream)
        })

        pc.current.onicecandidate = (event) => {
            if (event.candidate) {
                emitSignal({ candidate: event.candidate })
            }
        }

        pc.current.ontrack = (event) => {
            setRemoteStream(event.streams[0])
        }

        if (isInitiator) {
            createOffer()
        }
    }

    const handleSignal = async (signal: SignalData) => {
        if (signal.type === 'offer') {
            await pc.current!.setRemoteDescription(
                new RTCSessionDescription({ type: 'offer', sdp: signal.sdp?.sdp })
            )

            const answer = await pc.current?.createAnswer()
            await pc.current?.setLocalDescription(answer)
            emitSignal({ type: 'answer', sdp: answer })
        }

        if (signal.type === 'answer') {
            await pc.current?.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: signal.sdp?.sdp })
            )
        }

        if (signal.candidate) {
            await pc.current?.addIceCandidate(signal.candidate)
        }
    }

    const swapStream = (newStream: MediaStream) => {
        const videoTrack = newStream.getVideoTracks()[0]
        const sender = pc.current?.getSenders().find(s => s.track?.kind === 'video')
        sender?.replaceTrack(videoTrack)
    }

    const closeConnection = () => {
        pc.current?.close()
        pc.current = null
        setRemoteStream(null)
    }

    return { initConnection, handleSignal, closeConnection, swapStream }
}