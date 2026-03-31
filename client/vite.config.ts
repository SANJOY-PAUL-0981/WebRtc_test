import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: { //ngnix fixes
    host: '0.0.0.0',  // ← listen on all interfaces
    port: 5173,
    allowedHosts: ['unbroke-capacitively-erlene.ngrok-free.dev']
  },
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  /*optimizeDeps: {
    exclude: ['@mediapipe/face_mesh', '@mediapipe/hands']
  },
  ssr: {
    noExternal: ['@mediapipe/face_mesh', '@mediapipe/hands']
  }*/
})
