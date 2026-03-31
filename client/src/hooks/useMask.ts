import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { loadModel, calculateFaceTransform } from '../utils/maskUtils.js'
import { FaceLandmarker, GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision'

export const useMask = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const maskModelRef = useRef<THREE.Group | null>(null)
    const animationRef = useRef<number | null>(null)
    const faceMeshRef = useRef<FaceLandmarker | null>(null)
    const handsRef = useRef<GestureRecognizer | null>(null)
    const lastToggleRef = useRef<number>(0)

    const [maskReady, setMaskReady] = useState(false)
    const maskActiveRef = useRef(false)
    const [maskActive, setMaskActive] = useState(false)

    const toggleMask = () => {
        maskActiveRef.current = !maskActiveRef.current
        setMaskActive(maskActiveRef.current)
    }

    /*const setupThreeJS = async (width: number, height: number, videoElement: HTMLVideoElement) => {
        // create offscreen canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvasRef.current = canvas

        const scene = new THREE.Scene()
        sceneRef.current = scene

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.z = 5
        cameraRef.current = camera

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
        renderer.setSize(width, height)
        renderer.setClearColor(0x000000, 0)
        rendererRef.current = renderer

        // lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        scene.add(ambientLight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(0, 1, 2)
        scene.add(directionalLight)

        const model = await loadModel()
        maskModelRef.current = model
        scene.add(model)
        console.log('Three.js scene ready ✅')

        const animate = () => {
            animationRef.current = requestAnimationFrame(animate)

            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(videoElement, 0, 0, width, height)
            }
            renderer.render(scene, camera)
        }
        animate()

        setMaskReady(true)
    }*/

    const setupThreeJS = async (width: number, height: number, videoElement: HTMLVideoElement) => {
        // main canvas — this is what we show/stream
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvasRef.current = canvas
        const ctx = canvas.getContext('2d')!

        // offscreen canvas for Three.js only
        const threeCanvas = document.createElement('canvas')
        threeCanvas.width = width
        threeCanvas.height = height

        const scene = new THREE.Scene()
        sceneRef.current = scene

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
        camera.position.z = 3
        cameraRef.current = camera

        const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true })
        renderer.setSize(width, height)
        renderer.setClearColor(0x000000, 0)
        rendererRef.current = renderer

        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        scene.add(ambientLight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(0, 1, 2)
        scene.add(directionalLight)

        const model = await loadModel()
        maskModelRef.current = model
        scene.add(model)
        console.log('Three.js scene ready ')

        const animate = () => {
            animationRef.current = requestAnimationFrame(animate)

            // 1. draw video frame
            ctx.drawImage(videoElement, 0, 0, width, height)

            // 2. render Three.js mask onto threeCanvas
            renderer.render(scene, camera)

            // 3. composite mask on top of video
            ctx.drawImage(threeCanvas, 0, 0)
        }
        animate()

        setMaskReady(true)
    }

    const setupFaceMesh = async (videoElement: HTMLVideoElement) => {
        const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        )

        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1
        })

        faceMeshRef.current = faceLandmarker
        console.log('FaceLandmarker ready ✅')

        const detect = () => {
            if (videoElement.readyState >= 2) {
                const results = faceLandmarker.detectForVideo(videoElement, Date.now())

                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                    const landmarks = results.faceLandmarks[0]

                    if (maskModelRef.current && maskActiveRef.current) {
                        const { position, scale, rotation } = calculateFaceTransform(landmarks, 640, 480)
                        maskModelRef.current.position.copy(position)
                        maskModelRef.current.scale.setScalar(scale)
                        maskModelRef.current.rotation.copy(rotation)
                    }
                }
            }
            requestAnimationFrame(detect)
        }
        detect()
    }

    const setupHands = async (videoElement: HTMLVideoElement) => {
        const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        )

        const gestureRecognizer = await GestureRecognizer.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 1
        })

        handsRef.current = gestureRecognizer
        console.log('GestureRecognizer ready')

        let frameCount = 0
        const detect = () => {
            frameCount++
            if (videoElement.readyState >= 2 && frameCount % 3 === 0) {
                const results = gestureRecognizer.recognizeForVideo(videoElement, Date.now())

                if (results.gestures && results.gestures.length > 0) {
                    const gesture = results.gestures[0][0].categoryName
                    console.log('gesture:', gesture)

                    if (gesture === 'Open_Palm') {
                        const now = Date.now()
                        if (now - lastToggleRef.current > 2000) {
                            toggleMask()
                            lastToggleRef.current = now
                        }
                    }
                }
            }
            requestAnimationFrame(detect)
        }
        detect()
    }

    const getMaskedStream = (originalStream: MediaStream) => {
        const canvasStream = canvasRef.current?.captureStream(30)
        if (!canvasStream) return null

        originalStream.getAudioTracks().forEach(track => {
            canvasStream.addTrack(track)
        })

        return canvasStream
    }

    const cleanup = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
        }
        rendererRef.current?.dispose()
        faceMeshRef.current?.close()
        handsRef.current?.close()
    }

    useEffect(() => {
        return () => cleanup()
    }, [])

    return {
        canvasRef,
        sceneRef,
        cameraRef,
        rendererRef,
        maskModelRef,
        maskReady,
        maskActive,
        toggleMask,
        setupThreeJS,
        faceMeshRef,
        setupFaceMesh,
        setupHands,
        getMaskedStream

    }
}