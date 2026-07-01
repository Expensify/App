import {useEffect, useRef, useState} from 'react';
import CONST from '@src/CONST';
import type {Coordinate} from './MapViewTypes';
import utils from './utils';

type UseAnimatedLeadingDirectionCoordinateParams = {
    // Whether the animation is enabled
    isEnabled: boolean;

    // Target coordinate of the animation
    targetCoordinate: Coordinate | undefined;

    // List of coordinates which together forms a direction.
    directionCoordinates: Coordinate[][];
};

const ANIMATION_DURATION_MS = CONST.MAPBOX.GPS_ROUTE_ANIMATION_DURATION_MS;

function getLeadingSegmentData(directionCoordinates: Coordinate[][]) {
    const lastSegment = directionCoordinates?.at(-1);

    if (!lastSegment?.length) {
        return {
            secondToLastCoordinate: undefined,
            lastSegmentStartCoordinate: undefined,
        };
    }

    const lastSegmentStartCoordinate = lastSegment.at(0);
    const secondToLastCoordinate = lastSegment.length === 1 ? lastSegmentStartCoordinate : lastSegment.at(-2);

    return {
        secondToLastCoordinate,
        lastSegmentStartCoordinate,
    };
}

function useAnimatedLeadingDirectionCoordinate({directionCoordinates, isEnabled, targetCoordinate}: UseAnimatedLeadingDirectionCoordinateParams): Coordinate | undefined {
    const segmentCount = directionCoordinates.length;

    const leadingSegmentData = getLeadingSegmentData(directionCoordinates);
    // Why second to last, and not last? Because in edge cases, the last coordinate from directionCoordinates
    // would be closer to real user location than the targetCoordinate passed from MapBox location engine updates
    // and the animation would go the opposite way
    const secondToLastCoordinate = leadingSegmentData.secondToLastCoordinate;
    const lastSegmentStartCoordinate = leadingSegmentData.lastSegmentStartCoordinate;

    const [animatedCoordinate, setAnimatedCoordinate] = useState<Coordinate | undefined>(undefined);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const animatedCoordinateRef = useRef<Coordinate | undefined>(undefined);
    const animationStartTimeRef = useRef<number | undefined>(undefined);
    const prevSegmentCountRef = useRef<number | undefined>(undefined);
    const prevLastSegmentStartRef = useRef<Coordinate | undefined>(undefined);
    const prevTargetRef = useRef<Coordinate | undefined>(undefined);

    const cancelAnimation = () => {
        if (animationFrameRef.current !== undefined) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
        }
        animationStartTimeRef.current = undefined;
    };

    const startAnimation = (from: Coordinate, to: Coordinate) => {
        cancelAnimation();

        if (utils.areCoordinatesEqual(from, to)) {
            animatedCoordinateRef.current = to;
            setAnimatedCoordinate(to);
            return;
        }

        const animate = (timestamp: number) => {
            if (animationStartTimeRef.current === undefined) {
                animationStartTimeRef.current = timestamp;
            }

            const elapsed = timestamp - animationStartTimeRef.current;
            const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
            const nextCoordinate = utils.simpleInterpolateCoordinate(from, to, progress);
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
        // If the animation is not enabled or the target coordinate is not available, we need to cancel the animation
        if (!isEnabled || !targetCoordinate) {
            cancelAnimation();
            prevSegmentCountRef.current = undefined;
            prevLastSegmentStartRef.current = undefined;
            prevTargetRef.current = undefined;
            return cancelAnimation;
        }

        const hasSegmentBoundaryChanged = prevSegmentCountRef.current !== segmentCount || !utils.areCoordinatesEqual(prevLastSegmentStartRef.current, lastSegmentStartCoordinate);
        const hasTargetCoordinateChanged = !utils.areCoordinatesEqual(prevTargetRef.current, targetCoordinate);

        prevSegmentCountRef.current = segmentCount;
        prevLastSegmentStartRef.current = lastSegmentStartCoordinate;
        prevTargetRef.current = targetCoordinate;

        // If the segment boundary has changed, we need to start a new animation from the second to last coordinate or the target coordinate.
        if (hasSegmentBoundaryChanged) {
            animatedCoordinateRef.current = undefined;
            const fromCoordinate = secondToLastCoordinate ?? targetCoordinate;
            startAnimation(fromCoordinate, targetCoordinate);
            return cancelAnimation;
        }

        if (!hasTargetCoordinateChanged) {
            return;
        }

        // If the target coordinate has changed, we need to start a new animation from the current animated coordinate
        // (if there was an ongoing animation already) or the second to last coordinate
        const fromCoordinate = animatedCoordinateRef.current ?? secondToLastCoordinate ?? targetCoordinate;
        startAnimation(fromCoordinate, targetCoordinate);

        return cancelAnimation;
    }, [cancelAnimation, isEnabled, lastSegmentStartCoordinate, secondToLastCoordinate, targetCoordinate, segmentCount, startAnimation]);

    if (!isEnabled) {
        return undefined;
    }

    return animatedCoordinate;
}

export default useAnimatedLeadingDirectionCoordinate;
