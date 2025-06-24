import {useMemo, useRef} from 'react'
import {Vector3, Mesh, CanvasTexture} from 'three'
import {useFrame} from "@react-three/fiber";

interface UnicodeSprite3DProps {
    unicode: string
    fontSize?: number
    position?: [number, number, number]
    layFlat?: boolean
    opacity?: number
}

export function UnicodeSprite3D({
                                    unicode,
                                    fontSize = 1,
                                    layFlat = false,
    opacity = 1,
                                }: UnicodeSprite3DProps) {
    const spriteRef = useRef<Mesh>(null)

    const material = useMemo(() => {
        // Create canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        const resolution = 512;
        // Set canvas size
        canvas.width = resolution
        canvas.height = resolution

        // Configure text rendering
        context.font = `${fontSize * resolution / 2}px  "Noto Color Emoji", Arial, sans-serif`
        context.textBaseline = 'middle'
        context.textAlign = 'center'
        context.fillText(unicode, canvas.width / 2, canvas.height / 2)

        // Create texture and material
        const texture = new CanvasTexture(canvas)
        return {texture}
    }, [unicode, fontSize])

    useFrame(({camera}) => {
        if (spriteRef.current) {
            const obj = spriteRef.current
            const worldPos = new Vector3();
            obj.getWorldPosition(worldPos);
            const camPos = new Vector3()
            camera.getWorldPosition(camPos);
            if (!layFlat) {
                camPos.y = worldPos.y
                obj.lookAt(camPos)
            } else {
                // Flach liegen lassen (im XZ-Plane)
                obj.rotation.x = -Math.PI / 2

                // Blickrichtung zur Kamera auf XZ-Ebene (Rotation um Y)
                const camDir = new Vector3()
                camDir.subVectors(camPos, worldPos);
                obj.rotation.z = Math.atan2(camDir.x, camDir.z)
            }
        }
    })

    return (
        <mesh
            ref={spriteRef}
            rotation={layFlat ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
        >
            <planeGeometry args={[fontSize, fontSize]}/>
            {
                <meshStandardMaterial map={material.texture} transparent={true} opacity={opacity}/>
            }
        </mesh>
    )
}