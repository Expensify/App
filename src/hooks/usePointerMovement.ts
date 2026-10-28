import {useRef} from 'react';

type PointerPosition = {
    x: number;
    y: number;
};

type PointerMovement = {
    trackMovement: (event: {clientX: number; clientY: number}) => void;

    /** Forgets the tracked position and hands back the one the pointer was last seen moving at. */
    stopTracking: () => PointerPosition | null;
};

/**
 * Tracks where a pointer moves, ignoring travel shorter than `restRadius`, so a hand shaking on the spot counts as
 * still. The first move after mount and after `stopTracking` has nothing to measure against, so it always counts.
 *
 * `onMove` has to be a stable reference: it keys the memoization of whatever handler the caller builds from
 * `trackMovement`.
 */
function usePointerMovement(restRadius: number, onMove: () => void): PointerMovement {
    const positionRef = useRef<PointerPosition | null>(null);

    return {
        trackMovement: (event: {clientX: number; clientY: number}) => {
            const position = positionRef.current;

            if (position && Math.hypot(event.clientX - position.x, event.clientY - position.y) < restRadius) {
                return;
            }

            positionRef.current = {x: event.clientX, y: event.clientY};
            onMove();
        },
        stopTracking: () => {
            const position = positionRef.current;
            positionRef.current = null;

            return position;
        },
    };
}

export default usePointerMovement;
