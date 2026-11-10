import MultiGestureCanvas from '@components/MultiGestureCanvas';

import React from 'react';
import {useSharedValue} from 'react-native-reanimated';

import type VictoryChartExpandedContentProps from './types';

import ExpandedChartBox from './ExpandedChartBox';

/**
 * Touch devices: the chart is rendered once at the zoomed size and MultiGestureCanvas owns the
 * fit/pinch/double-tap transform, like the Lightbox does for image attachments.
 */
function BaseVictoryChartExpandedContent({availableSize, layout, isVisible, onSwipeDown}: VictoryChartExpandedContentProps) {
    const {hasLayout, fitScale, zoomHeadroom, renderWidth, renderHeight, clippedRenderHeight, backgroundColor, renderBorderRadius, isPolar} = layout;
    // No pager wraps this canvas
    const isPagerScrollEnabled = useSharedValue(false);

    if (!hasLayout) {
        return null;
    }

    return (
        <MultiGestureCanvas
            isActive={isVisible}
            canvasSize={availableSize}
            contentSize={{width: renderWidth, height: clippedRenderHeight}}
            // Zooming past the rendered resolution would blur the chart
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
                borderRadius={renderBorderRadius}
                isPolar={isPolar}
            />
        </MultiGestureCanvas>
    );
}

BaseVictoryChartExpandedContent.displayName = 'BaseVictoryChartExpandedContent';

export default BaseVictoryChartExpandedContent;
