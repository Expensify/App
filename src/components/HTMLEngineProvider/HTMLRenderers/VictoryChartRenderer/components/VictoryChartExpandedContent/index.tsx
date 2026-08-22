import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';

import type {SyntheticEvent} from 'react';
import type {GestureResponderEvent, View as RNView} from 'react-native';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {VictoryChartExpandedContentProps} from './types';

import BaseVictoryChartExpandedContent from './BaseVictoryChartExpandedContent';
import ExpandedChartBox from './ExpandedChartBox';
import useExpandedChartLayout from './useExpandedChartLayout';

/**
 * Desktop-web zoom for the expanded chart, mirroring the image attachment viewer (ImageView):
 * a zoom-in/zoom-out cursor, click to zoom into the clicked spot, mouse scroll (or drag while
 * zoomed) to pan — instead of the touch pinch/double-tap gestures.
 *
 * Because desktop zoom is a binary state, the chart is re-rendered natively at each state's exact
 * size, so it is pixel-crisp both fitted and zoomed.
 */
function DesktopVictoryChartExpandedContent({availableSize, isVisible}: VictoryChartExpandedContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const scrollableRef = useRef<RNView & HTMLDivElement>(null);
    const layout = useExpandedChartLayout(availableSize);

    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomDelta, setZoomDelta] = useState<{offsetX: number; offsetY: number}>();
    const [isDragging, setIsDragging] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [initialScrollLeft, setInitialScrollLeft] = useState(0);
    const [initialScrollTop, setInitialScrollTop] = useState(0);
    const [initialX, setInitialX] = useState(0);
    const [initialY, setInitialY] = useState(0);

    const onContainerPressIn = (e: GestureResponderEvent) => {
        const {pageX, pageY} = e.nativeEvent;
        setIsMouseDown(true);
        setInitialX(pageX);
        setInitialY(pageY);
        setInitialScrollLeft(scrollableRef.current?.scrollLeft ?? 0);
        setInitialScrollTop(scrollableRef.current?.scrollTop ?? 0);
    };

    const onContainerPress = (e?: GestureResponderEvent | KeyboardEvent | SyntheticEvent<Element, PointerEvent>) => {
        if (!isZoomed && !isDragging) {
            if (e && 'nativeEvent' in e && e.nativeEvent instanceof PointerEvent) {
                const {offsetX, offsetY} = e.nativeEvent;
                // Center the clicked spot in the zoomed view: map the fitted-space point into
                // zoomed space and scroll so it sits mid-viewport (clamped to the start edges).
                setZoomDelta({
                    offsetX: Math.max(0, offsetX * layout.zoomHeadroom - availableSize.width / 2),
                    offsetY: Math.max(0, offsetY * layout.zoomHeadroom - availableSize.height / 2),
                });
            } else {
                setZoomDelta({offsetX: 0, offsetY: 0});
            }
        }

        if (isZoomed && isDragging && isMouseDown) {
            setIsDragging(false);
            setIsMouseDown(false);
        } else {
            setIsZoomed(!isZoomed);
            setIsMouseDown(false);
        }
    };

    const trackPointerPosition = useCallback(
        (event: MouseEvent) => {
            // Whether the pointer is released inside the scrollable chart area
            const isInsideChartView = scrollableRef.current?.contains(event.target as Node);
            if (!isInsideChartView && isZoomed && isDragging && isMouseDown) {
                setIsDragging(false);
                setIsMouseDown(false);
            }
        },
        [isDragging, isMouseDown, isZoomed],
    );

    const trackMovement = useCallback(
        (event: MouseEvent) => {
            if (!isZoomed) {
                return;
            }
            if (isDragging && isMouseDown && scrollableRef.current) {
                const moveX = initialX - event.x;
                const moveY = initialY - event.y;
                scrollableRef.current.scrollLeft = initialScrollLeft + moveX;
                scrollableRef.current.scrollTop = initialScrollTop + moveY;
            }
            setIsDragging(isMouseDown);
        },
        [initialScrollLeft, initialScrollTop, initialX, initialY, isDragging, isMouseDown, isZoomed],
    );

    useEffect(() => {
        if (!isZoomed || !zoomDelta || !scrollableRef.current) {
            return;
        }
        scrollableRef.current.scrollLeft = zoomDelta.offsetX;
        scrollableRef.current.scrollTop = zoomDelta.offsetY;
    }, [zoomDelta, isZoomed]);

    useEffect(() => {
        document.addEventListener('mousemove', trackMovement);
        document.addEventListener('mouseup', trackPointerPosition);
        return () => {
            document.removeEventListener('mousemove', trackMovement);
            document.removeEventListener('mouseup', trackPointerPosition);
        };
    }, [trackMovement, trackPointerPosition]);

    if (!layout.hasLayout) {
        return null;
    }

    return (
        <View
            ref={scrollableRef}
            style={[styles.flex1, styles.w100, styles.overflowAuto, styles.pRelative]}
        >
            {/* Fills the viewport so the fitted chart centers. Centering is dropped while zoomed:
                flex-centering content larger than the scrollport pushes its start edges before the
                scroll origin, making the top/left of the chart unreachable. */}
            <View style={[styles.mnw100, styles.mnh100, !isZoomed && styles.justifyContentCenter, !isZoomed && styles.alignItemsCenter]}>
                <PressableWithoutFeedback
                    style={StyleUtils.getZoomCursorStyle(isZoomed, isDragging)}
                    onPressIn={onContainerPressIn}
                    onPress={onContainerPress}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.zoom')}
                    sentryLabel={CONST.SENTRY_LABEL.HTML_RENDERER.VICTORY_CHART_ZOOM}
                >
                    <ExpandedChartBox
                        width={isZoomed ? layout.renderWidth : layout.targetWidth}
                        height={isZoomed ? layout.renderHeight : layout.targetHeight}
                        clippedHeight={isZoomed ? layout.clippedRenderHeight : layout.clippedTargetHeight}
                        providerScale={isZoomed ? layout.fitScale * layout.zoomHeadroom : layout.fitScale}
                        isVisible={isVisible}
                        backgroundColor={layout.backgroundColor}
                        borderRadius={layout.borderRadius}
                        isPolar={layout.isPolar}
                    />
                </PressableWithoutFeedback>
            </View>
        </View>
    );
}

DesktopVictoryChartExpandedContent.displayName = 'DesktopVictoryChartExpandedContent';

/**
 * On touch devices the expanded chart zooms like the Lightbox (pinch/double-tap via
 * MultiGestureCanvas); on desktop web it zooms like the image attachment viewer (click + scroll).
 */
function VictoryChartExpandedContent(props: VictoryChartExpandedContentProps) {
    if (canUseTouchScreenUtil()) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <BaseVictoryChartExpandedContent {...props} />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <DesktopVictoryChartExpandedContent {...props} />;
}

VictoryChartExpandedContent.displayName = 'VictoryChartExpandedContent';

export default VictoryChartExpandedContent;
