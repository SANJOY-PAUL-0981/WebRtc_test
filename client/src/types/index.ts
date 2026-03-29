export type CallStatus = 'idle' | 'waiting' | 'in-call'

export interface RoomContextType {
    userName: string
    setUserName: React.Dispatch<React.SetStateAction<string>>
    roomId: string
    setRoomId: React.Dispatch<React.SetStateAction<string>>
    callStatus: CallStatus
    setCallStatus: React.Dispatch<React.SetStateAction<CallStatus>>
    isInitiator: boolean
    setIsInitiator: React.Dispatch<React.SetStateAction<boolean>>
    localStream: MediaStream | null
    setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
    remoteStream: MediaStream | null
    setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
}

export interface SignalData {
    type?: string
    sdp?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidate
}