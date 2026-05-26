import type {Color} from '@shopify/react-native-skia';
import JSON5 from 'json5';
import parseAttribute from './parseAttribute';

/**
 * Returns true when a value is a usable color string.
 */
function isValidColor(color: unknown): color is Color {
    return typeof color === 'string' && color.trim().length > 0 && color.trim() !== 'transparent';
}

/**
 * Parses a Victory `colorscale` attribute into a color array.
 * Preserves array indices so each slice maps to its corresponding scale entry.
 */
function parseColorScale(attribute: string | undefined): Color[] {
    if (!attribute) {
        return [];
    }

    const parsed = parseAttribute<Color[] | string>(attribute);

    if (Array.isArray(parsed)) {
        return parsed;
    }

    if (typeof parsed === 'string') {
        try {
            const reparsed = JSON5.parse<Color[]>(parsed);
            if (Array.isArray(reparsed)) {
                return reparsed;
            }
        } catch {
            return [];
        }
    }

    return [];
}

/**
 * Returns the slice fill color from the Victory `colorscale` prop.
 */
function getPieSliceColor(colorScale: Color[], index: number): Color {
    const directColor = colorScale.at(index);

    if (isValidColor(directColor)) {
        return directColor;
    }

    if (colorScale.length > 0) {
        const wrappedColor = colorScale.at(index % colorScale.length);

        if (isValidColor(wrappedColor)) {
            return wrappedColor;
        }
    }

    return '#000000';
}

export {getPieSliceColor, isValidColor};
export default parseColorScale;
