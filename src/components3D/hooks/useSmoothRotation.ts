import {type RefObject, useEffect, useRef} from "react";
import { useFrame } from "@react-three/fiber";
import type { Object3D } from "three";

const normalizeAngle = (angle: number) =>
    ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;

export function useSmoothRotation({
                                      targetAngle,
                                      groupRef,
                                      rotationDuration = 0.3,
                                  }: {
    targetAngle: number;
    groupRef: RefObject<Object3D>;
    rotationDuration?: number;
}) {
    const targetRotation = useRef(normalizeAngle(targetAngle));
    const currentRotation = useRef(normalizeAngle(targetAngle));

    useEffect(() => {
        targetRotation.current = normalizeAngle(targetAngle);
    }, [targetAngle]);

    useFrame((_, delta) => {
        let diff = normalizeAngle(targetRotation.current - currentRotation.current);
        diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
        const step = (delta / rotationDuration) * diff;

        if (Math.abs(diff) < 0.01) {
            currentRotation.current = targetRotation.current;
        } else {
            currentRotation.current += step;
        }

        currentRotation.current = normalizeAngle(currentRotation.current);

        if (groupRef.current) {
            groupRef.current.rotation.y = currentRotation.current;
        }
    });

    return currentRotation;
}
