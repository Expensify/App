import MultiGestureCanvas from '@components/MultiGestureCanvas';

import React from 'react';
import {useSharedValue} from 'react-native-reanimated';

import type VictoryChartExpandedContentProps from './types';

import ExpandedChartBox from './ExpandedChartBox';
import useExpandedChartLayout from './useExpandedChartLayout';

/**
 * Touch-device zoom for the expanded chart, mirroring the Lightbox/image-attachment pattern: the
 * chart is rendered ONCE at a fixed high resolution (like a 2x image asset) and handed to
 * MultiGestureCanvas at that intrinsic size. The canvas computes the fit scale itself and owns the
 * single transform for fitting, centering, and pinch/double-tap zooming — no manual transforms of
 * our own, since nested transforms rasterize the inner layer and blur it on native.
 */
function BaseVictoryChartExpandedContent({availableSize, isVisible, onSwipeDown}: VictoryChartExpandedContentProps) {
    const {hasLayout, fitScale, zoomHeadroom, renderWidth, renderHeight, clippedRenderHeight, backgroundColor, borderRadius, isPolar} = useExpandedChartLayout(availableSize);
    // No pager wraps this canvas, so scrolling never needs to be handed back to one.
    const isPagerScrollEnabled = useSharedValue(false);

    if (!hasLayout) {
        return null;
    }

    return (
        <MultiGestureCanvas
            isActive={isVisible}
            canvasSize={availableSize}
            contentSize={{width: renderWidth, height: clippedRenderHeight}}
            // Zooming past the rendered resolution would upscale pixels and blur the chart — cap
            // the zoom at the headroom the chart was actually rendered with.
            zoomRange={{max: zoomHeadroom}}
            isUsedInCarousel={false}
            isPagerScrollEnabled={isPagerScrollEnabled}
            onSwipeDown={onSwipeDown}
        >
            <ExpandedChartBox
                width={renderWidth}
                height={renderHeight}
                clippedHeight={clippedRenderHeight}
                providerScale={fitScale * zoomHeadroom}
                backgroundColor={backgroundColor}
                borderRadius={borderRadius}
                isPolar={isPolar}
            />
        </MultiGestureCanvas>
    );
}

BaseVictoryChartExpandedContent.displayName = 'BaseVictoryChartExpandedContent';

export default BaseVictoryChartExpandedContent;
