import { useRoom } from './context/RoomContext.js'
import JoinScreen from './components/JoinScreen.js'
import WaitingScreen from './components/WaitingScreen.js'
import CallScreen from './components/CallScreen.js'
import { useWebRTC } from './hooks/useWebRTC.js'
import { useSocketListeners } from './hooks/useSocket.js'

function App() {
  const { callStatus } = useRoom()
  const { handleSignal, initConnection, closeConnection, swapStream  } = useWebRTC()
  useSocketListeners(handleSignal)

  return (
    <>
      {callStatus === 'idle' && <JoinScreen />}
      {callStatus === 'waiting' && <WaitingScreen />}
      {callStatus === 'in-call' && <CallScreen initConnection={initConnection} closeConnection={closeConnection} swapStream={swapStream} />}
    </>
  )
}

export default App