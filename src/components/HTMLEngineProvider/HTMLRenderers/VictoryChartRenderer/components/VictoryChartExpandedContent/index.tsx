import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useClickZoomPan from '@hooks/useClickZoomPan';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';

import type {View as RNView} from 'react-native';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type VictoryChartExpandedContentProps from './types';

import BaseVictoryChartExpandedContent from './BaseVictoryChartExpandedContent';
import ExpandedChartBox from './ExpandedChartBox';
import useExpandedChartLayout from './useExpandedChartLayout';

/**
 * Desktop-web zoom for the expanded chart, mirroring the image attachment viewer (ImageView):
 * a zoom-in/zoom-out cursor, click to zoom into the clicked spot, mouse scroll (or drag while
 * zoomed) to pan — via the same useClickZoomPan hook the image viewer uses.
 *
 * Like a high-resolution image, the chart is rendered ONCE at the zoomed size and displayed
 * downscaled while fitted (crisp both ways), so toggling zoom only changes CSS — the Skia canvas
 * never re-renders and there is no flicker.
 */
function DesktopVictoryChartExpandedContent({availableSize, isVisible}: VictoryChartExpandedContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const scrollableRef = useRef<RNView & HTMLDivElement>(null);
    const layout = useExpandedChartLayout(availableSize);

    // On large displays the fitted chart can already use all the zoom headroom, in which case
    // clicking could not enlarge anything — hide the zoom affordance entirely.
    const canZoom = layout.zoomHeadroom > 1;

    const {isZoomed, isDragging, onContainerPressIn, onContainerPress, resetZoom} = useClickZoomPan({
        scrollableRef,
        containerSize: availableSize,
        zoomFactor: layout.zoomHeadroom,
    });

    // The modal stays mounted after closing so it reopens fast — reset the zoom so it never
    // reopens in a stale zoomed state (the touch path resets via MultiGestureCanvas.isActive).
    useEffect(() => {
        if (isVisible) {
            return;
        }
        resetZoom();
    }, [isVisible, resetZoom]);

    if (!layout.hasLayout) {
        return null;
    }

    const chartBox = (
        <View
            style={[
                StyleUtils.getWidthAndHeightStyle(isZoomed ? layout.renderWidth : layout.targetWidth, isZoomed ? layout.clippedRenderHeight : layout.clippedTargetHeight),
                styles.overflowHidden,
            ]}
        >
            {/* The chart is always rendered at the zoomed size; while fitted it is displayed
                downscaled — like a 2x image asset — so zooming never re-renders the canvas. */}
            <View style={StyleUtils.getTopLeftTransformScaleStyle(isZoomed ? 1 : 1 / layout.zoomHeadroom)}>
                <ExpandedChartBox
                    width={layout.renderWidth}
                    height={layout.renderHeight}
                    clippedHeight={layout.clippedRenderHeight}
                    providerScale={layout.fitScale * layout.zoomHeadroom}
                    backgroundColor={layout.backgroundColor}
                    borderRadius={layout.borderRadius}
                    isPolar={layout.isPolar}
                />
            </View>
        </View>
    );

    return (
        <View
            ref={scrollableRef}
            style={[styles.flex1, styles.w100, styles.overflowAuto, styles.pRelative]}
        >
            {/* Fills the viewport so the fitted chart centers. Centering is dropped while zoomed:
                flex-centering content larger than the scroll viewport pushes its start edges before
                the scroll origin, making the top/left of the chart unreachable. */}
            <View style={[styles.mnw100, styles.mnh100, !isZoomed && styles.justifyContentCenter, !isZoomed && styles.alignItemsCenter]}>
                {canZoom ? (
                    <PressableWithoutFeedback
                        style={StyleUtils.getZoomCursorStyle(isZoomed, isDragging)}
                        onPressIn={onContainerPressIn}
                        onPress={onContainerPress}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.zoom')}
                        sentryLabel={CONST.SENTRY_LABEL.HTML_RENDERER.VICTORY_CHART_ZOOM}
                    >
                        {chartBox}
                    </PressableWithoutFeedback>
                ) : (
                    chartBox
                )}
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
        return <BaseVictoryChartExpandedContent {...props} />;
    }
    return <DesktopVictoryChartExpandedContent {...props} />;
}

VictoryChartExpandedContent.displayName = 'VictoryChartExpandedContent';

export default VictoryChartExpandedContent;
