import getDraggedSize from '@components/ResizeHandle/getDraggedSize';
import usePointerDrag from '@components/ResizeHandle/usePointerDrag';

import useSingleRHPWidth from '@hooks/useSingleRHPWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import {setSingleRHPWidth} from '@libs/actions/SingleRHPWidth';
import {clearLiveSingleRHPWidth, writeLiveSingleRHPWidth} from '@libs/Navigation/helpers/singleRHPWidth';

import CONST from '@src/CONST';

import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type Drag = {
    startClientX: number;

    startWidth: number;

    /** Last width painted into CSS, `undefined` until the pointer moves. */
    liveWidth?: number;
};

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
    width: CONST.RESIZE_HANDLE.INDICATOR_WIDTH,
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
    const pointerDrag = usePointerDrag<Drag>({
        dragRef,
        onMove: (drag, clientX) => {
            const liveWidth = getDraggedSize(drag.startWidth, drag.startClientX - clientX, {min, max});
            writeLiveSingleRHPWidth(liveWidth);
            // eslint-disable-next-line no-param-reassign -- the drag is the ref's own object, read back when the drag ends
            drag.liveWidth = liveWidth;
        },
        onEnd: ({liveWidth}) => {
            setIsDragging(false);

            // Nothing gets saved, so no render follows to clear the live width.
            if (liveWidth === undefined || liveWidth === width) {
                clearLiveSingleRHPWidth();
                return;
            }

            setSingleRHPWidth(liveWidth);
        },
    });

    // React now renders the saved width as the fallback, so drop the live one before paint. A window resize mid-drag leaves it to the drag.
    useLayoutEffect(() => {
        if (dragRef.current) {
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
                    if (!pointerDrag.startDrag(event, () => ({startClientX: event.clientX, startWidth: width}))) {
                        return;
                    }
                    setIsDragging(true);
                }}
                {...pointerDrag.handlers}
            >
                {(isHovered || isDragging) && (
                    <div
                        aria-hidden
                        style={{...LINE_STYLE, ...styles.resizeIndicator}}
                    />
                )}
            </div>
        </View>
    );
}

export default RHPResizeHandle;
