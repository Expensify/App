/** The pointer lifecycle of dragging a resize handle on web, which relies on DOM pointer capture. */
import useThemeStyles from '@hooks/useThemeStyles';

import type React from 'react';
import type {RefObject} from 'react';

import {useEffect} from 'react';

type PointerDragEvent = React.PointerEvent<HTMLDivElement>;

type UsePointerDragParams<Drag> = {
    /** The drag in progress, `null` at rest. Owned by the caller, so code set up before the drag handlers can read it. */
    dragRef: RefObject<Drag | null>;

    onMove: (drag: Drag, clientX: number) => void;

    /** Called once however the drag ends: release, cancel, or the browser reclaiming capture. `isRelease` is set only for a release. */
    onEnd: (drag: Drag, event: PointerDragEvent, isRelease: boolean) => void;
};

type PointerDrag<Drag> = {
    /** Starts a drag from the handle's pointerdown. `createDrag` runs only once the press starts one. Returns `false` when it doesn't. */
    startDrag: (event: PointerDragEvent, createDrag: () => Drag) => boolean;

    handlers: Pick<React.DOMAttributes<HTMLDivElement>, 'onPointerMove' | 'onPointerUp' | 'onPointerCancel' | 'onLostPointerCapture'>;
};

function usePointerDrag<Drag>({dragRef, onMove, onEnd}: UsePointerDragParams<Drag>): PointerDrag<Drag> {
    const styles = useThemeStyles();

    const setDrag = (drag: Drag | null) => {
        // eslint-disable-next-line no-param-reassign -- the caller owns the ref, so code set up before the drag handlers can read the drag
        dragRef.current = drag;
        // On the whole page mid-drag, so the cursor doesn't flicker once the pointer outruns the handle.
        document.body.style.cursor = drag ? (styles.cursorColResize.cursor ?? '') : '';
    };

    const startDrag = (event: PointerDragEvent, createDrag: () => Drag) => {
        // Secondary buttons open context menus rather than dragging.
        if (event.button !== 0) {
            return false;
        }

        // Keeps the drag from selecting text, and from reaching whatever is pressable underneath.
        event.preventDefault();
        event.stopPropagation();

        event.currentTarget.setPointerCapture(event.pointerId);

        setDrag(createDrag());
        return true;
    };

    const onPointerMove = (event: PointerDragEvent) => {
        if (!dragRef.current) {
            return;
        }

        onMove(dragRef.current, event.clientX);
    };

    /** The browser releases capture right after pointerup and pointercancel, so the lostpointercapture that follows is a no-op. */
    const endDrag = (event: PointerDragEvent, isRelease = false) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        setDrag(null);
        onEnd(drag, event, isRelease);
    };

    // Unmounting mid-drag would otherwise leave the resize cursor on the document and a dangling drag.
    useEffect(
        () => () => {
            if (!dragRef.current) {
                return;
            }

            setDrag(null);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on unmount only
        [],
    );

    return {startDrag, handlers: {onPointerMove, onPointerUp: (event) => endDrag(event, true), onPointerCancel: endDrag, onLostPointerCapture: endDrag}};
}

export default usePointerDrag;
