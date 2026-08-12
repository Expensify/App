import type {CartesianChartProps} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import lodashIsObject from 'lodash/isObject';

import parseAttribute from './parseAttribute';

type Padding = CartesianChartProps['padding'];

/**
 * Translate VictoryChart's `padding` attribute into victory-native's `padding` shape.
 */
function parsePadding(attribute: string): Padding {
    const padding = parseAttribute(attribute);
    if (typeof padding === 'number') {
        return padding;
    }
    if (lodashIsObject(padding)) {
        let left: number | undefined;
        let right: number | undefined;
        let top: number | undefined;
        let bottom: number | undefined;
        if ('left' in padding && typeof padding.left === 'number') {
            left = padding.left;
        }
        if ('right' in padding && typeof padding.right === 'number') {
            right = padding.right;
        }
        if ('top' in padding && typeof padding.top === 'number') {
            top = padding.top;
        }
        if ('bottom' in padding && typeof padding.bottom === 'number') {
            bottom = padding.bottom;
        }
        return {left, right, top, bottom};
    }
    return undefined;
}

export default parsePadding;
