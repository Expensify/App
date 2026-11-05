/** The draggable edge of a right-docked pane (the RHP, the side panel) on web, which relies on DOM pointer capture. */
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {RefObject} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import getDraggedSize from './getDraggedSize';
import usePointerDrag from './usePointerDrag';

type Drag = {
    startClientX: number;

    startWidth: number;

    /** Whether the pointer passed the drag slop. Until then, releasing it is a click. */
    hasMovedPointer: boolean;

    /** Last width painted into CSS, `undefined` until the pointer moves. */
    liveWidth?: number;
};

type PaneResizeHandleProps = {
    /** The committed width, already clamped to `min` and `max`. */
    width: number;

    min: number;

    max: number;

    /** The width a drag snaps onto and a click resets to. */
    defaultWidth: number;

    /** Paints a width mid-drag without rendering. Several handles over one pane must share the same function, which keys their shared drag. */
    writeLiveWidth: (width: number) => void;

    /** Drops the painted width, so styles fall back to the committed one. */
    clearLiveWidth: () => void;

    onCommit: (width: number) => void;

    onReset: () => void;

    /** Positions the strip that picks up a drag over the pane's left edge. */
    style: StyleProp<ViewStyle>;
};

/** A pane and a modal stacked on it can each mount a handle over one live width, so an idle handle must not clear it while another drags. */
const lastDragRefByLiveWidth = new Map<PaneResizeHandleProps['writeLiveWidth'], RefObject<Drag | null>>();

// DOM `div` styles, which the React Native style system can't type.
const HANDLE_STYLE: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    touchAction: 'none',
};

// Flush against the outside of the pane's border, which the handle straddles, so the line runs straight past rounded corners.
const LINE_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: '50%',
    borderRadius: CONST.RESIZE_HANDLE.PANE_SNAPPED_INDICATOR_WIDTH / 2,
    pointerEvents: 'none',
};

/** Pressing and dragging left widens the pane, a click resets it, and coming near the default snaps onto it. */
function PaneResizeHandle({width, min, max, defaultWidth, writeLiveWidth, clearLiveWidth, onCommit, onReset, style}: PaneResizeHandleProps) {
    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef<Drag | null>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const snap = {to: defaultWidth, threshold: CONST.RESIZE_HANDLE.PANE_SNAP_THRESHOLD};

    /** Thickens the line while a drag is held on the default width. Set on the DOM, so a drag stays free of React renders. */
    const setLineSnapped = (isSnapped: boolean) => {
        lineRef.current?.style.setProperty('width', `${isSnapped ? CONST.RESIZE_HANDLE.PANE_SNAPPED_INDICATOR_WIDTH : CONST.RESIZE_HANDLE.PANE_ACTIVE_INDICATOR_WIDTH}px`);
    };

    const pointerDrag = usePointerDrag<Drag>({
        dragRef,
        onMove: (drag, clientX) => {
            // A mouse click rarely lands on the exact pixel it started from, so nothing is painted inside the slop.
            if (!drag.hasMovedPointer) {
                if (Math.abs(clientX - drag.startClientX) <= CONST.RESIZE_HANDLE.DRAG_SLOP) {
                    return;
                }

                // Kept once set, so a drag that comes back to where it started isn't a click.
                // eslint-disable-next-line no-param-reassign -- the drag is the ref's own object
                drag.hasMovedPointer = true;
            }

            const liveWidth = getDraggedSize(drag.startWidth, drag.startClientX - clientX, {min, max, snap});

            // Pressing an edge already on the default and moving within the threshold changes nothing, so the snapped line waits for a real snap.
            if (liveWidth === (drag.liveWidth ?? drag.startWidth)) {
                return;
            }

            writeLiveWidth(liveWidth);
            setLineSnapped(liveWidth === snap.to);
            // eslint-disable-next-line no-param-reassign -- the drag is the ref's own object, read back when the drag ends
            drag.liveWidth = liveWidth;
        },
        onEnd: ({hasMovedPointer, liveWidth}, event, isRelease) => {
            setIsDragging(false);

            // A cancelled press or reclaimed capture isn't a click, so only a release resets.
            if (!hasMovedPointer && isRelease) {
                onReset();
                return;
            }

            // Nothing gets saved, so no render follows to clear the live width.
            if (liveWidth === undefined || liveWidth === width) {
                clearLiveWidth();
                return;
            }

            if (liveWidth === snap.to) {
                onReset();
                return;
            }

            onCommit(liveWidth);
        },
    });

    // React now renders the saved width as the fallback, so drop the live one before paint. A window resize mid-drag leaves it to the drag.
    useLayoutEffect(() => {
        if (lastDragRefByLiveWidth.get(writeLiveWidth)?.current) {
            return;
        }

        clearLiveWidth();
    }, [width, writeLiveWidth, clearLiveWidth]);

    // The document outlives the handle, so unmounting before the save renders would otherwise pin the pane at the live width.
    useEffect(() => clearLiveWidth, [clearLiveWidth]);

    return (
        <View style={style}>
            {/* A plain `div` because it relies on DOM pointer capture. */}
            <div
                style={{...HANDLE_STYLE, ...styles.cursorColResize}}
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => setIsHovered(false)}
                onPointerDown={(event) => {
                    if (!pointerDrag.startDrag(event, () => ({startClientX: event.clientX, startWidth: width, hasMovedPointer: false}))) {
                        return;
                    }
                    lastDragRefByLiveWidth.set(writeLiveWidth, dragRef);
                    setIsDragging(true);
                }}
                {...pointerDrag.handlers}
            >
                {(isHovered || isDragging) && (
                    <div
                        ref={lineRef}
                        aria-hidden
                        style={{
                            ...LINE_STYLE,
                            width: isDragging ? CONST.RESIZE_HANDLE.PANE_ACTIVE_INDICATOR_WIDTH : CONST.RESIZE_HANDLE.INDICATOR_WIDTH,
                            ...styles.resizeIndicator,
                        }}
                    />
                )}
            </div>
        </View>
    );
}

export default PaneResizeHandle;
export type {PaneResizeHandleProps};
