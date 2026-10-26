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

    let resolvedPadding = padding;
    if (typeof resolvedPadding === 'number') {
        resolvedPadding = {
            left: resolvedPadding,
            right: resolvedPadding,
            top: resolvedPadding,
            bottom: resolvedPadding,
        };
    }

    // Shrink `padding.left` down to the left axis's measured label width (plus a small edge buffer)
    // whenever the configured padding is wider than the label content actually needs.
    if (isHorizontal && leftAxisSize && resolvedPadding.left) {
        resolvedPadding.left = Math.min(resolvedPadding.left, leftAxisSize + LEFT_AXIS_LABEL_PADDING);
    }

    // Shrink the paddings further to take into account the axis labels size
    if (yAxis?.[0].tickCount && leftAxisSize && resolvedPadding.left) {
        resolvedPadding.left -= leftAxisSize;
    }
    if (yAxis?.[0].tickCount && rightAxisSize && resolvedPadding.right) {
        resolvedPadding.right -= rightAxisSize;
    }
    if (xAxis?.tickCount && bottomAxisSize && resolvedPadding.bottom) {
        resolvedPadding.bottom -= bottomAxisSize;
    }
    if (xAxis?.tickCount && topAxisSize && resolvedPadding.top) {
        resolvedPadding.top -= topAxisSize;
    }

    return resolvedPadding;
}

export default resolvePadding;
