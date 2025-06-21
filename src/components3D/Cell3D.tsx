import {Group, Quaternion, RepeatWrapping, TextureLoader, Vector3} from "three";
import {freeCellTypes, type TCell, wallCellTypes} from "../logic/Map.ts";
import {useRef} from "react";
import {useLoader} from "@react-three/fiber";
import groundTextureUrl from "../assets/ground_512x512.jpg";
import wallTextureUrl from "../assets/wall_512x512.jpg";
import roofTextureUrl from "../assets/roof_512x512.jpg";

const groundQuat = new Quaternion()
    .setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)
    .toArray() as [number, number, number, number];
const roofQuat = new Quaternion()
    .setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
    .toArray() as [number, number, number, number];

export function Cell3D({cell}: { cell: TCell}) {
    const height = 2;
    const group = useRef<Group>(null!)
    const groundTexture = useLoader(TextureLoader, groundTextureUrl);
    const wallTexture = useLoader(TextureLoader, wallTextureUrl);
    const roofTexture  = useLoader(TextureLoader, roofTextureUrl);
    wallTexture.wrapT = RepeatWrapping;
    wallTexture.wrapS = RepeatWrapping;
    wallTexture.repeat.set(1, height);
    return (
        <group ref={group} position={[cell.x, height/2, cell.y]} >
            {wallCellTypes.has(cell.type) &&
                <>
                    <mesh>
                        <boxGeometry args={[1, height, 1,1,height,1]}/>
                        <meshStandardMaterial color={"#ffffff"} wireframe={false} map={wallTexture}/>
                    </mesh>
                </>
            }
            {freeCellTypes.has(cell.type) &&
                <>
                    <mesh position={[0,-height/2,0]} quaternion={groundQuat} >
                        <planeGeometry args={[1, 1, 1, 1]}/>
                        <meshStandardMaterial color={"#ffffff"} wireframe={false} map={groundTexture}/>
                    </mesh>
                    <mesh position={[0,height/2,0]} quaternion={roofQuat} >
                        <planeGeometry args={[1, 1, 1, 1]}/>
                        <meshStandardMaterial color={"#ffffff"} wireframe={false} map={roofTexture}/>
                    </mesh>
                </>
            }
        </group>
    );
}