import lodashIsObject from 'lodash/isObject';
import type {RoundedCorners} from 'victory-native';
import parseAttribute from './parseAttribute';

/**
 * Translate VictoryChart's `cornerRadius` attribute into victory-native's `roundedCorners` shape.
 */
function parseCornerRadius(attribute: string): RoundedCorners | undefined {
    const cornerRadius = parseAttribute(attribute);
    if (typeof cornerRadius === 'number') {
        return {
            topLeft: cornerRadius,
            topRight: cornerRadius,
            bottomLeft: cornerRadius,
            bottomRight: cornerRadius,
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
        return {topLeft, topRight, bottomLeft, bottomRight};
    }
    return undefined;
}

export default parseCornerRadius;
