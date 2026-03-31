import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// swap this to try different models
import modelPath from '../assets/spiderman_paperbag_mask.glb?url'

export const loadModel = async (): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        loader.load(
            modelPath,
            (gltf) => {
                console.log('model loaded successfully', gltf)
                resolve(gltf.scene)
            },
            (progress) => {
                console.log('loading:', (progress.loaded / progress.total * 100) + '%')
            },
            (error) => {
                console.error('model load error:', error)
                reject(error)
            }
        )
    })
}

// VIBE CODED - but now i understand whats happening
export const calculateFaceTransform = (landmarks: any[], width: number, height: number) => {
    const noseTip = landmarks[1]
    const chin = landmarks[152]
    const leftEye = landmarks[33]
    const rightEye = landmarks[263]
    const leftEar = landmarks[234]
    const rightEar = landmarks[454]

    const x = (noseTip.x - 0.5) * 2
    const y = -(noseTip.y - 0.5) * 2

    const position = new THREE.Vector3(x, y, 0)

    const eyeDistance = Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) +
        Math.pow(rightEye.y - leftEye.y, 2)
    )
    const faceHeight = Math.sqrt(
        Math.pow(noseTip.x - chin.x, 2) +
        Math.pow(noseTip.y - chin.y, 2)
    )
    const scale = (eyeDistance + faceHeight) / 2 * 35

    // Z — head tilt left/right
    const zRotation = -Math.atan2(
        rightEye.y - leftEye.y,
        rightEye.x - leftEye.x
    )

    // Y — head turning left/right using ear distance difference
    const earDistance = rightEar.x - leftEar.x
    const yRotation = (noseTip.x - 0.5) * Math.PI * 1.2

    // X — head nodding up/down
    const xRotation = (noseTip.y - 0.5) * Math.PI * 0.5

    const rotation = new THREE.Euler(xRotation, yRotation, zRotation)

    return { position, scale, rotation }
}