import getDraggedSize from '@components/ResizeHandle/getDraggedSize';
import type {DraggedSizeSnap} from '@components/ResizeHandle/getDraggedSize';
import usePointerDrag from '@components/ResizeHandle/usePointerDrag';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useSidePanelWidth from '@hooks/useSidePanelWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import {resetSidePanelWidth, setSidePanelWidth} from '@libs/actions/SidePanelWidth';
import {clearLiveSidePanelWidth, writeLiveSidePanelWidth} from '@libs/Navigation/helpers/sidePanelWidth';

import variables from '@styles/variables';

import CONST from '@src/CONST';

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

const SNAP: DraggedSizeSnap = {to: variables.sidePanelWidth, threshold: CONST.RHP_RESIZE.SNAP_THRESHOLD};

// DOM `div` styles, which the React Native style system can't type.
const HANDLE_STYLE: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    touchAction: 'none',
};

// Flush against the outside of the panel's border, which the handle straddles.
const LINE_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: '50%',
    borderRadius: CONST.RHP_RESIZE.SNAPPED_INDICATOR_WIDTH / 2,
    pointerEvents: 'none',
};

/** Drags the Side Panel's left edge. While the panel is docked, the content beside it follows the drag through the panel offset. */
function SidePanelResizeHandle() {
    const styles = useThemeStyles();
    const {width, min, max} = useSidePanelWidth();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {sidePanelOffset, shouldHideSidePanel} = useSidePanelState();
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef<Drag | null>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    const isDocked = isExtraLargeScreenWidth && !shouldHideSidePanel;

    /** Thickens the line while a drag is held on the default width. Set on the DOM, so a drag stays free of React renders. */
    const setLineSnapped = (isSnapped: boolean) => {
        lineRef.current?.style.setProperty('width', `${isSnapped ? CONST.RHP_RESIZE.SNAPPED_INDICATOR_WIDTH : CONST.RHP_RESIZE.ACTIVE_INDICATOR_WIDTH}px`);
    };

    /** Paints a width on the panel and, when docked, on the content beside it. */
    const paintWidth = (liveWidth: number) => {
        writeLiveSidePanelWidth(liveWidth);
        if (isDocked) {
            sidePanelOffset.current.setValue(liveWidth);
        }
    };

    /** Drops the live width, putting the panel and the content beside it back on the committed width. */
    const clearWidth = () => {
        clearLiveSidePanelWidth();
        if (isDocked) {
            sidePanelOffset.current.setValue(width);
        }
    };

    const pointerDrag = usePointerDrag<Drag>({
        dragRef,
        onMove: (drag, clientX) => {
            // A mouse click rarely lands on the exact pixel it started from, so nothing is painted inside the slop.
            if (!drag.hasMovedPointer) {
                if (Math.abs(clientX - drag.startClientX) <= CONST.RESIZE_HANDLE.DRAG_SLOP) {
                    return;
                }

                // eslint-disable-next-line no-param-reassign -- the drag is the ref's own object
                drag.hasMovedPointer = true;
            }

            const liveWidth = getDraggedSize(drag.startWidth, drag.startClientX - clientX, {min, max, snap: SNAP});

            if (liveWidth === (drag.liveWidth ?? drag.startWidth)) {
                return;
            }

            paintWidth(liveWidth);
            setLineSnapped(liveWidth === SNAP.to);
            // eslint-disable-next-line no-param-reassign -- the drag is the ref's own object, read back when the drag ends
            drag.liveWidth = liveWidth;
        },
        onEnd: ({hasMovedPointer, liveWidth}, event, isRelease) => {
            setIsDragging(false);

            // A cancelled press or reclaimed capture isn't a click, so only a release resets.
            if (!hasMovedPointer && isRelease) {
                resetSidePanelWidth();
                return;
            }

            // Nothing gets saved, so no render follows to clear the live width.
            if (liveWidth === undefined || liveWidth === width) {
                clearWidth();
                return;
            }

            if (liveWidth === SNAP.to) {
                resetSidePanelWidth();
                return;
            }

            setSidePanelWidth(liveWidth);
        },
    });

    // React now renders the saved width as the fallback, so drop the live one before paint. A window resize mid-drag leaves it to the drag.
    useLayoutEffect(() => {
        if (dragRef.current) {
            return;
        }

        clearLiveSidePanelWidth();
    }, [width]);

    // The document outlives the handle, so unmounting before the save renders would otherwise pin the panel at the live width.
    useEffect(() => clearLiveSidePanelWidth, []);

    return (
        <View style={styles.sidePanelResizeHandle}>
            {/* A plain `div` because it relies on DOM pointer capture. */}
            <div
                style={{...HANDLE_STYLE, ...styles.cursorColResize}}
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => setIsHovered(false)}
                onPointerDown={(event) => {
                    if (!pointerDrag.startDrag(event, () => ({startClientX: event.clientX, startWidth: width, hasMovedPointer: false}))) {
                        return;
                    }
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

export default SidePanelResizeHandle;
