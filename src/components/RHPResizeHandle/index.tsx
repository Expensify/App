import getDraggedSize from '@components/ResizeHandle/getDraggedSize';
import type {DraggedSizeSnap} from '@components/ResizeHandle/getDraggedSize';
import usePointerDrag from '@components/ResizeHandle/usePointerDrag';

import useSingleRHPWidth from '@hooks/useSingleRHPWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import {resetSingleRHPWidth, setSingleRHPWidth} from '@libs/actions/SingleRHPWidth';
import {clearLiveSingleRHPWidth, writeLiveSingleRHPWidth} from '@libs/Navigation/helpers/singleRHPWidth';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {RefObject} from 'react';

import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type Drag = {
    startClientX: number;

    startWidth: number;

    /** Whether the pointer passed the drag slop. Until then, releasing it is a click. */
    hasMovedPointer: boolean;

    /** Last width painted into CSS, `undefined` until the pointer moves. */
    liveWidth?: number;
};

const SNAP: DraggedSizeSnap = {to: variables.rhpWidth, threshold: CONST.RHP_RESIZE.SNAP_THRESHOLD};

/** The RHP and a modal stacked on it each mount a handle over the one live width, so an idle handle must not clear it while the other drags. */
let lastDragRef: RefObject<Drag | null> | null = null;

// DOM `div` styles, which the React Native style system can't type.
const HANDLE_STYLE: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    touchAction: 'none',
};

// Flush against the outside of the card's border, which the handle straddles, so the line runs straight past the card's rounded corners.
const LINE_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: '50%',
    borderRadius: CONST.RHP_RESIZE.SNAPPED_INDICATOR_WIDTH / 2,
    pointerEvents: 'none',
};

/**
 * Drags the single RHP card's left edge. A sibling of the card rather than a child, because the card clips its overflow,
 * and rendered after the overlay so it wins hit-testing over the scrim that closes the RHP.
 */
function RHPResizeHandle() {
    const styles = useThemeStyles();
    const {width, min, max} = useSingleRHPWidth();
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef<Drag | null>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    /** Thickens the line while a drag is held on the default width. Set on the DOM, so a drag stays free of React renders. */
    const setLineSnapped = (isSnapped: boolean) => {
        lineRef.current?.style.setProperty('width', `${isSnapped ? CONST.RHP_RESIZE.SNAPPED_INDICATOR_WIDTH : CONST.RHP_RESIZE.ACTIVE_INDICATOR_WIDTH}px`);
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

            const liveWidth = getDraggedSize(drag.startWidth, drag.startClientX - clientX, {min, max, snap: SNAP});

            // Pressing an edge already on the default and moving within the threshold changes nothing, so the snapped line waits for a real snap.
            if (liveWidth === (drag.liveWidth ?? drag.startWidth)) {
                return;
            }

            writeLiveSingleRHPWidth(liveWidth);
            setLineSnapped(liveWidth === SNAP.to);
            // eslint-disable-next-line no-param-reassign -- the drag is the ref's own object, read back when the drag ends
            drag.liveWidth = liveWidth;
        },
        onEnd: ({hasMovedPointer, liveWidth}, event, isRelease) => {
            setIsDragging(false);

            // A cancelled press or reclaimed capture isn't a click, so only a release resets.
            if (!hasMovedPointer && isRelease) {
                resetSingleRHPWidth();
                return;
            }

            // Nothing gets saved, so no render follows to clear the live width.
            if (liveWidth === undefined || liveWidth === width) {
                clearLiveSingleRHPWidth();
                return;
            }

            if (liveWidth === SNAP.to) {
                resetSingleRHPWidth();
                return;
            }

            setSingleRHPWidth(liveWidth);
        },
    });

    // React now renders the saved width as the fallback, so drop the live one before paint. A window resize mid-drag leaves it to the drag.
    useLayoutEffect(() => {
        if (lastDragRef?.current) {
            return;
        }

        clearLiveSingleRHPWidth();
    }, [width]);

    // The document outlives the handle, so unmounting before the save renders would otherwise pin the cards at the live width.
    useEffect(() => clearLiveSingleRHPWidth, []);

    return (
        <View style={styles.rhpResizeHandle(width)}>
            {/* A plain `div` because it relies on DOM pointer capture. */}
            <div
                style={{...HANDLE_STYLE, ...styles.cursorColResize}}
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => setIsHovered(false)}
                onPointerDown={(event) => {
                    if (!pointerDrag.startDrag(event, () => ({startClientX: event.clientX, startWidth: width, hasMovedPointer: false}))) {
                        return;
                    }
                    lastDragRef = dragRef;
                    setIsDragging(true);
                }}
                {...pointerDrag.handlers}
            >
                {(isHovered || isDragging) && (
                    <div
                        ref={lineRef}
                        aria-hidden
                        style={{...LINE_STYLE, width: isDragging ? CONST.RHP_RESIZE.ACTIVE_INDICATOR_WIDTH : CONST.RESIZE_HANDLE.INDICATOR_WIDTH, ...styles.resizeIndicator}}
                    />
                )}
            </div>
        </View>
    );
}

export default RHPResizeHandle;
