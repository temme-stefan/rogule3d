import {Quaternion, RepeatWrapping, TextureLoader, Vector3} from "three";
import {freeCellTypes, type TMap, wallCellTypes} from "../logic/Map.ts";
import {Fragment, memo} from "react";
import {useLoader} from "@react-three/fiber";
import groundTextureUrl from "../assets/ground_512x512.jpg";
import wallTextureUrl from "../assets/wall_512x512.jpg";
import roofTextureUrl from "../assets/roof_512x512.jpg";
import {Instance, Instances} from "@react-three/drei";

const groundQuaternion = new Quaternion()
    .setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)
    .toArray() as [number, number, number, number];

const roofQuaternion = new Quaternion()
    .setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
    .toArray() as [number, number, number, number];


export const Board3D = memo(function Board3D({board}: { board: TMap["board"] }) {
    const height = 2;
    const groundTexture = useLoader(TextureLoader, groundTextureUrl);
    const roofTexture = useLoader(TextureLoader, roofTextureUrl);
    const wallTexture = useLoader(TextureLoader, wallTextureUrl);
    wallTexture.wrapT = RepeatWrapping;
    wallTexture.wrapS = RepeatWrapping;
    wallTexture.repeat.set(1, height);
    const cellsByType = Map.groupBy(board.flat(), c => c.type);
    return [...cellsByType.entries()].map(([type, cells]) => {
        if (wallCellTypes.has(type)) {
            return (
                <Instances limit={cells.length} key={type + "_wall"}>
                    <boxGeometry args={[1, height, 1, 1, height, 1]}/>
                    <meshStandardMaterial color={"#ffffff"} wireframe={false} map={wallTexture}/>
                    {cells.map(cell => (
                        <Instance key={`${cell.x}|${cell.y}_wall`} position={[cell.x, height / 2, cell.y]}/>
                    ))}
                </Instances>
            )
        }
        if (freeCellTypes.has(type)) {
            return (
                <Fragment key={`${type}_free`}>
                    <Instances limit={cells.length} key={`${type}_ground`}>
                        <planeGeometry args={[1, 1, 1, 1]}/>
                        <meshStandardMaterial color={"#ffffff"} wireframe={false} map={groundTexture}/>
                        {cells.map(cell => (
                            <Instance key={`${cell.x}|${cell.y}_ground`} position={[cell.x, 0, cell.y]}
                                      quaternion={groundQuaternion}/>
                        ))}
                    </Instances>
                    <Instances limit={cells.length} key={`${type}_roof`}>
                        <planeGeometry args={[1, 1, 1, 1]}/>
                        <meshStandardMaterial color={"#ffffff"} wireframe={false} map={roofTexture}/>
                        {cells.map(cell => (
                            <Instance key={`${cell.x}|${cell.y}_roof`} position={[cell.x, height, cell.y]}
                                      quaternion={roofQuaternion}/>
                        ))}
                    </Instances>

                </Fragment>
            )
        }
        return <Fragment key={`${type}_unknown`}/>;
    })
})