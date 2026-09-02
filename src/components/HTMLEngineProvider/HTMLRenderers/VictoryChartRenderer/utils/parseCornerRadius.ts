import scalePixels from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/scalePixels';

import type {RoundedCorners} from 'victory-native';

import lodashIsObject from 'lodash/isObject';

import parseAttribute from './parseAttribute';

/**
 * Translate VictoryChart's `cornerRadius` attribute into victory-native's `roundedCorners` shape.
 * `pixelScale` multiplies every radius, so expanded charts rendered at a larger native size keep
 * their corners proportional to the inline chart.
 */
function parseCornerRadius(attribute: string, pixelScale = 1): RoundedCorners | undefined {
    const cornerRadius = parseAttribute(attribute);
    if (typeof cornerRadius === 'number') {
        return {
            topLeft: cornerRadius * pixelScale,
            topRight: cornerRadius * pixelScale,
            bottomLeft: cornerRadius * pixelScale,
            bottomRight: cornerRadius * pixelScale,
        };
    }
    if (lodashIsObject(cornerRadius)) {
        let topLeft: number | undefined;
        let topRight: number | undefined;
        let bottomLeft: number | undefined;
        let bottomRight: number | undefined;
        if ('topLeft' in cornerRadius) {
            topLeft = Number(cornerRadius.topLeft);
        } else if ('top' in cornerRadius) {
            topLeft = Number(cornerRadius.top);
        }
        if ('topRight' in cornerRadius) {
            topRight = Number(cornerRadius.topRight);
        } else if ('top' in cornerRadius) {
            topRight = Number(cornerRadius.top);
        }
        if ('bottomLeft' in cornerRadius) {
            bottomLeft = Number(cornerRadius.bottomLeft);
        } else if ('bottom' in cornerRadius) {
            bottomLeft = Number(cornerRadius.bottom);
        }
        if ('bottomRight' in cornerRadius) {
            bottomRight = Number(cornerRadius.bottomRight);
        } else if ('bottom' in cornerRadius) {
            bottomRight = Number(cornerRadius.bottom);
        }
        return {
            topLeft: scalePixels(topLeft, pixelScale),
            topRight: scalePixels(topRight, pixelScale),
            bottomLeft: scalePixels(bottomLeft, pixelScale),
            bottomRight: scalePixels(bottomRight, pixelScale),
        };
    }
    return undefined;
}

export default parseCornerRadius;
