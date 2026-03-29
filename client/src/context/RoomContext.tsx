import { createContext, useContext, useState } from "react"
import type { CallStatus, RoomContextType } from "../types/index.js"

const RoomContext = createContext<RoomContextType | null>(null)

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
    const [userName, setUserName] = useState<string>('')
    const [roomId, setRoomId] = useState<string>('')
    const [callStatus, setCallStatus] = useState<CallStatus>('idle')
    const [isInitiator, setIsInitiator] = useState<boolean>(false)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

    return (
        <RoomContext.Provider value={{
            userName, setUserName,
            roomId, setRoomId,
            callStatus, setCallStatus,
            isInitiator, setIsInitiator,
            localStream, setLocalStream,
            remoteStream, setRemoteStream
        }}>
            {children}
        </RoomContext.Provider>
    )
}

export const useRoom = () => {
    const context = useContext(RoomContext)
    if (!context) throw new Error("useRoom must be used within RoomProvider")
    return context
}