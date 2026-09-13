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

/**
 * Desktop web: click-to-zoom with scroll/drag panning, like the image attachment viewer. The chart
 * is rendered once at the zoomed size and shown downscaled while fitted, so zooming is CSS-only.
 */
function DesktopVictoryChartExpandedContent({availableSize, layout, isVisible}: VictoryChartExpandedContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const scrollableRef = useRef<RNView & HTMLDivElement>(null);

    // No headroom (very large displays) means clicking couldn't enlarge anything
    const canZoom = layout.zoomHeadroom > 1;

    // Click offsets are reported in the chart's own (render-space) coordinates, so no conversion is needed
    const {isZoomed, isDragging, onContainerPressIn, onContainerPress, resetZoom} = useClickZoomPan({
        scrollableRef,
        containerSize: availableSize,
        zoomFactor: 1,
    });

    // Don't reopen in a stale zoomed state
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
            <View style={StyleUtils.getTopLeftTransformScaleStyle(isZoomed ? 1 : 1 / layout.zoomHeadroom)}>
                <ExpandedChartBox
                    width={layout.renderWidth}
                    height={layout.renderHeight}
                    clippedHeight={layout.clippedRenderHeight}
                    providerScale={layout.fitScale * layout.zoomHeadroom}
                    backgroundColor={layout.backgroundColor}
                    borderRadius={layout.renderBorderRadius}
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
            {/* Centering is dropped while zoomed: centered overflow would push the chart's top/left past the scroll origin */}
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

/** Touch devices zoom like the Lightbox; desktop web zooms like the image attachment viewer. */
function VictoryChartExpandedContent(props: VictoryChartExpandedContentProps) {
    if (canUseTouchScreenUtil()) {
        return <BaseVictoryChartExpandedContent {...props} />;
    }
    return <DesktopVictoryChartExpandedContent {...props} />;
}

VictoryChartExpandedContent.displayName = 'VictoryChartExpandedContent';

export default VictoryChartExpandedContent;
