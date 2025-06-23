import {useMemo, useRef} from 'react'
import * as THREE from 'three'
import {useFrame} from "@react-three/fiber";

interface UnicodeSprite3DProps {
    unicode: string
    fontSize?: number
    position?: [number, number, number]
    layFlat?: boolean
}

export function UnicodeSprite3D({
                                    unicode,
                                    fontSize = 1,
                                    position = [0, 0, 0],
                                    layFlat = false
                                }: UnicodeSprite3DProps) {
    const spriteRef = useRef<THREE.Sprite>(null)
    
    const material = useMemo(() => {
        // Create canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        const resolution = 512;
        // Set canvas size
        canvas.width = resolution
        canvas.height = resolution

        // Configure text rendering
        context.font = `${fontSize * resolution/2}px  "Noto Color Emoji", Arial, sans-serif`
        context.textBaseline = 'middle'
        context.textAlign = 'center'
        context.fillStyle = 'white'
        context.fillText(unicode, canvas.width / 2, canvas.height / 2)
        context.fillStyle = 'red'
        context.textAlign = 'center'
        context.textBaseline = 'middle'

        // Draw unicode character
        context.fillText(unicode, canvas.width / 2, canvas.height / 2)

        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas)
        return {texture}
    }, [unicode, fontSize])

    useFrame(( {camera}) => {
        if (spriteRef.current) {
            const obj = spriteRef.current
            if (!layFlat) {
                const camPos = camera.position.clone()
                camPos.y = obj.position.y
                obj.lookAt(camPos)
            } else {
                // Flach liegen lassen (im XZ-Plane)
                obj.rotation.x = -Math.PI / 2

                // Blickrichtung zur Kamera auf XZ-Ebene (Rotation um Y)
                const camDir = new THREE.Vector3()
                camDir.subVectors(camera.position, obj.position)
                obj.rotation.z = Math.atan2(camDir.x, camDir.z)
            }
        }
    })

    return (
        <mesh
            ref={spriteRef}
            position={position}
            rotation={layFlat ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
        >
            <planeGeometry args={[1, 1]}/>{
            <meshStandardMaterial map={material.texture} transparent={true} />
        }
        </mesh>
    )
}