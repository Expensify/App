import type {CurveType} from 'victory-native';
import parseAttribute from './parseAttribute';

/**
 * Translate VictoryChart's `interpolation` attribute into victory-native's `curveType` attribute.
 */
function parseCurveType(attribute: string): CurveType | undefined {
    const curveType = parseAttribute(attribute);
    const validCurveTypes = [
        'linear',
        'natural',
        'bumpX',
        'bumpY',
        'cardinal',
        'cardinal50',
        'catmullRom',
        'catmullRom0',
        'catmullRom100',
        'monotoneX',
        'step',
        'stepAfter',
        'stepBefore',
        'basis',
    ] as const;
    return validCurveTypes.find((validCurveType) => validCurveType === curveType);
}

export default parseCurveType;
