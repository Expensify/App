import {LEFT_AXIS_LABEL_PADDING} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import lodashIsObject from 'lodash/isObject';

/**
 * Shrinks the padding to take into account the size consumed by the axis.
 */
function resolvePadding(
    padding: ProcessNodeResult['padding'],
    leftAxisSize: ProcessNodeResult['leftAxisSize'],
    rightAxisSize: ProcessNodeResult['rightAxisSize'],
    bottomAxisSize: ProcessNodeResult['bottomAxisSize'],
    topAxisSize: ProcessNodeResult['topAxisSize'],
): ProcessNodeResult['padding'] {
    let resolvedPadding = padding;
    if (!resolvedPadding || typeof resolvedPadding === 'number') {
        resolvedPadding = {
            left: resolvedPadding,
            right: resolvedPadding,
            top: resolvedPadding,
            bottom: resolvedPadding,
        };
    }

    if (leftAxisSize && resolvedPadding.left) {
        resolvedPadding.left = Math.min(resolvedPadding.left, leftAxisSize + LEFT_AXIS_LABEL_PADDING) - leftAxisSize;
    }
    if (rightAxisSize && resolvedPadding.right) {
        resolvedPadding.right -= rightAxisSize;
    }
    if (bottomAxisSize && resolvedPadding.bottom) {
        resolvedPadding.bottom -= bottomAxisSize;
    }
    if (topAxisSize && resolvedPadding.top) {
        resolvedPadding.top -= topAxisSize;
    }

    return resolvedPadding;
}

export default resolvePadding;
