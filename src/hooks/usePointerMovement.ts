import {useRef} from 'react';

type PointerPosition = {
    /** Horizontal position of the pointer, in viewport pixels. */
    x: number;

    /** Vertical position of the pointer, in viewport pixels. */
    y: number;
};

type PointerMovement = {
    /** Handles a pointer move. `onMove` runs only for a pointer that traveled past the rest radius. */
    trackMovement: (event: {clientX: number; clientY: number}) => void;

    /** Forgets the tracked position and hands back the one the pointer was last seen moving at. */
    stopTracking: () => PointerPosition | null;
};

/**
 * Tracks where a pointer moves, ignoring travel shorter than `restRadius`, so a hand shaking on the spot counts as
 * still. The position it kept is what tells a later handler which way the pointer was heading.
 *
 * @param restRadius How far the pointer has to travel, in pixels, before it counts as moving.
 * @param onMove Called for a move past that radius.
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
