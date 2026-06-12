import {useEffect, useRef, useState} from 'react';
import type {Coordinate} from './MapViewTypes';
import utils from './utils';

type UseAnimatedTrailingDirectionCoordinateParams = {
    isEnabled: boolean;
    segmentCount: number;
    lastSegmentStartLongitude?: number;
    lastSegmentStartLatitude?: number;
    secondToLastLongitude?: number;
    secondToLastLatitude?: number;
    targetLongitude?: number;
    targetLatitude?: number;
    durationMs: number;
};

function useAnimatedTrailingDirectionCoordinate({
    isEnabled,
    segmentCount,
    lastSegmentStartLongitude,
    lastSegmentStartLatitude,
    secondToLastLongitude,
    secondToLastLatitude,
    targetLongitude,
    targetLatitude,
    durationMs,
}: UseAnimatedTrailingDirectionCoordinateParams): Coordinate | undefined {
    const [animatedCoordinate, setAnimatedCoordinate] = useState<Coordinate | undefined>(undefined);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const animatedCoordinateRef = useRef<Coordinate | undefined>(undefined);
    const animationStartTimeRef = useRef<number | undefined>(undefined);
    const prevSegmentCountRef = useRef<number | undefined>(undefined);
    const prevLastSegmentStartLongitudeRef = useRef<number | undefined>(undefined);
    const prevLastSegmentStartLatitudeRef = useRef<number | undefined>(undefined);
    const prevTargetLongitudeRef = useRef<number | undefined>(undefined);
    const prevTargetLatitudeRef = useRef<number | undefined>(undefined);

    const cancelAnimation = () => {
        if (animationFrameRef.current !== undefined) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
        }
        animationStartTimeRef.current = undefined;
    };

    const startAnimation = (from: Coordinate, to: Coordinate) => {
        cancelAnimation();

        const animate = (timestamp: number) => {
            if (animationStartTimeRef.current === undefined) {
                animationStartTimeRef.current = timestamp;
            }

            const elapsed = timestamp - animationStartTimeRef.current;
            const progress = Math.min(elapsed / durationMs, 1);
            const nextCoordinate = utils.interpolateCoordinate(from, to, progress);
            animatedCoordinateRef.current = nextCoordinate;
            setAnimatedCoordinate(nextCoordinate);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                animationFrameRef.current = undefined;
                animationStartTimeRef.current = undefined;
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!isEnabled || targetLongitude === undefined || targetLatitude === undefined) {
            cancelAnimation();
            prevSegmentCountRef.current = undefined;
            prevLastSegmentStartLongitudeRef.current = undefined;
            prevLastSegmentStartLatitudeRef.current = undefined;
            prevTargetLongitudeRef.current = undefined;
            prevTargetLatitudeRef.current = undefined;
            return cancelAnimation;
        }

        const hasSegmentBoundaryChanged =
            prevSegmentCountRef.current !== segmentCount ||
            prevLastSegmentStartLongitudeRef.current !== lastSegmentStartLongitude ||
            prevLastSegmentStartLatitudeRef.current !== lastSegmentStartLatitude;
        const hasTargetCoordinateChanged = prevTargetLongitudeRef.current !== targetLongitude || prevTargetLatitudeRef.current !== targetLatitude;

        prevSegmentCountRef.current = segmentCount;
        prevLastSegmentStartLongitudeRef.current = lastSegmentStartLongitude;
        prevLastSegmentStartLatitudeRef.current = lastSegmentStartLatitude;
        prevTargetLongitudeRef.current = targetLongitude;
        prevTargetLatitudeRef.current = targetLatitude;

        const targetCoordinate: Coordinate = [targetLongitude, targetLatitude];
        const secondToLastCoordinate: Coordinate | undefined =
            secondToLastLongitude !== undefined && secondToLastLatitude !== undefined ? [secondToLastLongitude, secondToLastLatitude] : undefined;

        if (hasSegmentBoundaryChanged) {
            animatedCoordinateRef.current = undefined;
            const fromCoordinate = secondToLastCoordinate ?? targetCoordinate;
            startAnimation(fromCoordinate, targetCoordinate);
            return cancelAnimation;
        }

        if (!hasTargetCoordinateChanged) {
            return;
        }

        const fromCoordinate = animatedCoordinateRef.current ?? secondToLastCoordinate ?? targetCoordinate;
        startAnimation(fromCoordinate, targetCoordinate);

        return cancelAnimation;
    }, [
        cancelAnimation,
        durationMs,
        isEnabled,
        lastSegmentStartLatitude,
        lastSegmentStartLongitude,
        secondToLastLatitude,
        secondToLastLongitude,
        segmentCount,
        startAnimation,
        targetLatitude,
        targetLongitude,
    ]);

    if (!isEnabled) {
        return undefined;
    }

    return animatedCoordinate;
}

export default useAnimatedTrailingDirectionCoordinate;
