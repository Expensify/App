import type {SkFont} from '@shopify/react-native-skia';
import {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';

type ChartDataPoint = {
    label: string;
    currency?: string;
};

type UseChartLabelFormatsProps = {
    data: ChartDataPoint[];
    font: SkFont | null;
    yAxisUnit?: string;
    yAxisUnitPosition?: 'left' | 'right';
    labelSkipInterval: number;
    labelRotation: number;
    truncatedLabels: string[];
};

/**
 * Checks if all characters in the text can be rendered by the font.
 * Returns true if all glyphs are supported (no glyph ID is 0).
 *
 * TODO: This is a temporary solution until we properly support rendering all currency symbols in the chart font.
 */
function canFontRenderText(font: SkFont, text: string): boolean {
    const glyphIDs = font.getGlyphIDs(text);
    return glyphIDs.every((id) => id !== 0);
}

/**
 * Returns the currency symbol if font supports it, otherwise returns the 3-letter currency code.
 */
function getDisplayUnit(font: SkFont | null, currencySymbol: string | undefined, currencyCode: string | undefined): string | undefined {
    if (!currencySymbol) {
        return currencyCode;
    }

    if (!font) {
        return currencySymbol;
    }

    if (canFontRenderText(font, currencySymbol)) {
        return currencySymbol;
    }

    return currencyCode;
}

export default function useChartLabelFormats({data, font, yAxisUnit, yAxisUnitPosition = 'left', labelSkipInterval, labelRotation, truncatedLabels}: UseChartLabelFormatsProps) {
    const {numberFormat} = useLocalize();

    // Derive currency code from data for fallback when font can't render the symbol
    const currencyCode = data.at(0)?.currency;
    const displayUnit = getDisplayUnit(font, yAxisUnit, currencyCode);

    const formatYAxisLabel = useCallback(
        (value: number) => {
            const formatted = numberFormat(value);
            if (!displayUnit) {
                return formatted;
            }
            // Add space for multi-character codes (e.g., "PLN 100") but not for symbols (e.g., "$100")
            const separator = displayUnit.length > 1 ? ' ' : '';
            return yAxisUnitPosition === 'left' ? `${displayUnit}${separator}${formatted}` : `${formatted}${separator}${displayUnit}`;
        },
        [displayUnit, yAxisUnitPosition, numberFormat],
    );

    const formatXAxisLabel = useCallback(
        (value: number) => {
            const index = Math.round(value);

            // Skip labels based on calculated interval
            if (index % labelSkipInterval !== 0) {
                return '';
            }

            // Use pre-truncated labels
            // If rotation is vertical (-90), we usually want full labels
            // because they have more space vertically.
            const sourceToUse = labelRotation === -90 ? data.map((p) => p.label) : truncatedLabels;

            return sourceToUse.at(index) ?? '';
        },
        [labelSkipInterval, labelRotation, truncatedLabels, data],
    );

    return {
        formatXAxisLabel,
        formatYAxisLabel,
        displayUnit,
    };
}
