import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RoomProvider } from './context/RoomContext.tsx'

createRoot(document.getElementById('root')!).render(
  <RoomProvider>
    <App />
  </RoomProvider>
)
