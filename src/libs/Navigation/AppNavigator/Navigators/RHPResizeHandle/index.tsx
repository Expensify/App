/** The draggable left edge of the single RHP card on web, which resizes the card. */
import getDraggedSize from '@components/ResizeHandle/getDraggedSize';
import usePointerDrag from '@components/ResizeHandle/usePointerDrag';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {applySingleRHPWidth, clampSingleRHPWidth, getSingleRHPWidth} from '@libs/Navigation/helpers/singleRHPWidth';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useLayoutEffect, useRef, useState} from 'react';
// The handle rides the Side Panel offset, which is a react-native Animated value.
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';

type RHPResizeHandleProps = {
    /** How far the Side Panel pushes the RHP card in from the window's right edge. */
    sidePanelOffset: Animated.Value;
};

type Drag = {
    /** Where the pointer went down. */
    startClientX: number;

    /** The RHP's width when the drag started. */
    startWidth: number;
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
function RHPResizeHandle({sidePanelOffset}: RHPResizeHandleProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {shouldHideSidePanel} = useSidePanelState();
    // Mirrors when SidePanelContextProvider shifts the RHP left by the panel's width.
    const {min, max} = getSingleRHPWidthBounds(windowWidth, isExtraLargeScreenWidth && !shouldHideSidePanel ? variables.sidePanelWidth : 0);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef<Drag | null>(null);
    const pointerDrag = usePointerDrag<Drag>({
        dragRef,
        onMove: (drag, clientX) => applySingleRHPWidth(getDraggedSize(drag.startWidth, drag.startClientX - clientX, {min, max})),
        onEnd: () => setIsDragging(false),
    });

    // A narrower window or an opening Side Panel lowers the max, so the width shrinks to fit. Before paint, so an RHP opened
    // after the window shrank never shows a frame at the old width.
    useLayoutEffect(() => clampSingleRHPWidth(min, max), [min, max]);

    return (
        // Anchored to the card's right edge, which only the Side Panel moves, then shifted the card's width further left.
        <Animated.View style={styles.rhpResizeHandleAnchor(Animated.add(sidePanelOffset, variables.rhpFloatingCardMargin + 2 * variables.rhpFloatingCardBorderWidth))}>
            <View style={styles.rhpResizeHandleHitArea}>
                {/* A plain `div` because it relies on DOM pointer capture. */}
                <div
                    style={{...HANDLE_STYLE, ...styles.cursorColResize}}
                    onPointerEnter={() => setIsHovered(true)}
                    onPointerLeave={() => setIsHovered(false)}
                    onPointerDown={(event) => {
                        if (!pointerDrag.startDrag(event, {startClientX: event.clientX, startWidth: getSingleRHPWidth()})) {
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
        </Animated.View>
    );
}

export default RHPResizeHandle;
