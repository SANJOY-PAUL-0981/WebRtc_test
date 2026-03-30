import { io } from 'socket.io-client';
import type { SignalData } from '../types/index.js';
import { useEffect } from 'react';
import { useRoom } from '../context/RoomContext.js';

const socket = io('http://localhost:3000') //this for local use
//const socket = io(window.location.origin) //this for the ngnix setup

// call anywhere for emits
export const useSocket = () => {
    const emitJoin = (name: string) => socket.emit('join', { name })
    const emitSignal = (signal: SignalData) => socket.emit('signal', { signal })
    const emitLeave = () => socket.emit('leave')

    return { emitJoin, emitSignal, emitLeave, socket }
}

// call ONCE in App.tsx only
export const useSocketListeners = (onSignal: (signal: SignalData) => void) => {
    const { setRoomId, setCallStatus, setIsInitiator } = useRoom()

    useEffect(() => {
        socket.on('waiting', ({ roomId }) => {
            setRoomId(roomId)
            setCallStatus('waiting')
        })

        socket.on('peer-joined', ({ roomId, initiator }) => {
            setRoomId(roomId)
            setIsInitiator(socket.id === initiator)
            setCallStatus('in-call')
        })

        socket.on('signal', ({ signal }) => {
            onSignal(signal)
        })

        socket.on('peer-left', () => {
            setCallStatus('idle')
        })

        return () => {
            socket.off('waiting')
            socket.off('peer-joined')
            socket.off('signal')
            socket.off('peer-left')
        }
    }, [])
}