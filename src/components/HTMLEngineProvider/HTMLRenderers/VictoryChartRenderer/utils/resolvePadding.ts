import {LEFT_AXIS_LABEL_PADDING} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

/**
 * Shrinks the padding to take into account the size consumed by the axis.
 */
function resolvePadding(
    padding: ProcessNodeResult['padding'],
    xAxis: ProcessNodeResult['xAxis'],
    yAxis: ProcessNodeResult['yAxis'],
    leftAxisSize: ProcessNodeResult['leftAxisSize'],
    rightAxisSize: ProcessNodeResult['rightAxisSize'],
    bottomAxisSize: ProcessNodeResult['bottomAxisSize'],
    topAxisSize: ProcessNodeResult['topAxisSize'],
    isHorizontal: ProcessNodeResult['isHorizontal'],
): ProcessNodeResult['padding'] {
    if (!padding) {
        return;
    }

    let resolvedPadding: ProcessNodeResult['padding'];
    if (typeof padding === 'number') {
        resolvedPadding = {
            left: padding,
            right: padding,
            top: padding,
            bottom: padding,
        };
    } else {
        resolvedPadding = {...padding};
    }

    // Shrink `padding.left` down to the left axis's measured label width (plus a small edge buffer)
    // whenever the configured padding is wider than the label content actually needs.
    if (isHorizontal && leftAxisSize && resolvedPadding.left) {
        resolvedPadding.left = Math.min(resolvedPadding.left, leftAxisSize + LEFT_AXIS_LABEL_PADDING);
    }

    // Shrink the paddings further to take into account the axis labels size
    // The shrink is only needed if we are actually going to draw the axis labels i.e. `tickCount` > 0
    const shouldShrinkLeftPadding = Object.values(yAxis ?? {}).some((y) => y.tickCount && y.axisSide === 'left');
    const shouldShrinkRightPadding = Object.values(yAxis ?? {}).some((y) => y.tickCount && y.axisSide === 'right');
    const shouldShrinkBottomPadding = xAxis?.tickCount && xAxis.axisSide === 'bottom';
    const shouldShrinkTopPadding = xAxis?.tickCount && xAxis.axisSide === 'top';
    if (shouldShrinkLeftPadding && leftAxisSize && resolvedPadding.left) {
        resolvedPadding.left -= leftAxisSize;
    }
    if (shouldShrinkRightPadding && rightAxisSize && resolvedPadding.right) {
        resolvedPadding.right -= rightAxisSize;
    }
    if (shouldShrinkBottomPadding && bottomAxisSize && resolvedPadding.bottom) {
        resolvedPadding.bottom -= bottomAxisSize;
    }
    if (shouldShrinkTopPadding && topAxisSize && resolvedPadding.top) {
        resolvedPadding.top -= topAxisSize;
    }

    return resolvedPadding;
}

export default resolvePadding;
