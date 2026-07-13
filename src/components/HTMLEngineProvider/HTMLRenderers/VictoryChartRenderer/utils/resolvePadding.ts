import {LEFT_AXIS_LABEL_EDGE_BUFFER} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import lodashIsObject from 'lodash/isObject';

/**
 * Shrinks `padding.left` down to the left axis's measured label width (plus a small edge buffer)
 * whenever the configured padding is wider than the label content actually needs.
 */
function resolvePadding(padding: ProcessNodeResult['padding'], leftAxisLabelSpace: ProcessNodeResult['leftAxisLabelSpace']): ProcessNodeResult['padding'] {
    if (leftAxisLabelSpace === undefined || !lodashIsObject(padding) || typeof padding.left !== 'number') {
        return padding;
    }
    return {...padding, left: Math.min(padding.left, Math.ceil(leftAxisLabelSpace) + LEFT_AXIS_LABEL_EDGE_BUFFER)};
}

export default resolvePadding;
