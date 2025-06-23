import {type RefObject, useEffect, useRef} from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Object3D } from "three";

export function useSmoothPosition({
                                      targetPosition,
                                      groupRef,
                                      positionDuration = 0.3,
                                  }: {
    targetPosition: Vector3;
    groupRef: RefObject<Object3D>;
    positionDuration?: number;
}) {
    const targetRef = useRef(targetPosition.clone());
    const currentRef = useRef(targetPosition.clone());

    useEffect(() => {
        targetRef.current.copy(targetPosition);
    }, [targetPosition]);

    useFrame((_, delta) => {
        const diff = new Vector3().subVectors(targetRef.current, currentRef.current);

        const distance = diff.length();
        const stepSize = (delta / positionDuration) * distance;

        if (distance < 0.01) {
            currentRef.current.copy(targetRef.current);
        } else {
            currentRef.current.add(diff.normalize().multiplyScalar(stepSize));
        }

        if (groupRef.current) {
            groupRef.current.position.copy(currentRef.current);
        }
    });

    return currentRef;
}
