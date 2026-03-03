import type {SkFont} from '@shopify/react-native-skia';
import type {ChartDataPoint, UnitPosition, UnitWithFallback} from '@components/Charts/types';
import useLocalize from '@hooks/useLocalize';
import {LABEL_ROTATIONS} from './useChartLabelLayout';

type UseChartLabelFormatsProps = {
    data: ChartDataPoint[];
    font?: SkFont | null;
    unit?: UnitWithFallback | string;
    unitPosition?: UnitPosition;
    labelSkipInterval?: number;
    labelRotation?: number;
    truncatedLabels?: string[];
};

/**
 * Checks if all characters in the text can be rendered by the font.
 * Returns true if all glyphs are supported (no glyph ID is 0).
 */
function canFontRenderText(font: SkFont, text: string): boolean {
    const glyphIDs = font.getGlyphIDs(text);
    return glyphIDs.every((id) => id !== 0);
}

/**
 * Resolves the display unit based on font support.
 * If unit is a string, returns it directly.
 * If unit is an object, checks if font can render the value and uses fallback if not.
 */
function resolveDisplayUnit(font: SkFont | null | undefined, unit: UnitWithFallback | string | undefined): string | undefined {
    if (!unit) {
        return undefined;
    }

    if (typeof unit === 'string') {
        return unit;
    }

    return !font || canFontRenderText(font, unit.value) ? unit.value : unit.fallback;
}

export default function useChartLabelFormats({data, font, unit, unitPosition = 'left', labelSkipInterval = 1, labelRotation = 0, truncatedLabels}: UseChartLabelFormatsProps) {
    const {numberFormat} = useLocalize();

    const displayUnit = resolveDisplayUnit(font, unit);

    const formatValue = (value: number) => {
        const formatted = numberFormat(value);
        if (!displayUnit) {
            return formatted;
        }
        const separator = displayUnit.length > 1 ? ' ' : '';
        return unitPosition === 'left' ? `${displayUnit}${separator}${formatted}` : `${formatted}${separator}${displayUnit}`;
    };

    const formatLabel = (value: number) => {
        const index = Math.round(value);

        if (index % labelSkipInterval !== 0) {
            return '';
        }

        const sourceToUse = labelRotation === -LABEL_ROTATIONS.VERTICAL || !truncatedLabels ? data.map((p) => p.label) : truncatedLabels;

        return sourceToUse.at(index) ?? '';
    };

    return {
        formatLabel,
        formatValue,
    };
}
