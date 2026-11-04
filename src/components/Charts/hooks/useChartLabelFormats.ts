import type {ChartDataPoint, ChartValueFormatter, LabelRotation, UnitPosition, UnitWithFallback} from '@components/Charts/types';
import {canFontRenderText} from '@components/Charts/utils';
import {LABEL_ROTATIONS} from '@components/Charts/VictoryTheme';

import useLocalize from '@hooks/useLocalize';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

type UseChartLabelFormatsProps = {
    data: ChartDataPoint[];
    unit?: UnitWithFallback | string;
    unitPosition?: UnitPosition;

    /** Formats plotted values instead of the unit-carrying number format, for charts plotting something other than money */
    formatValue?: ChartValueFormatter;

    labelSkipInterval?: number;
    labelRotation?: LabelRotation;
    truncatedLabels?: string[];
    fontManager?: SkTypefaceFontProvider | null;
};

/** Totals with up to this many integer digits (under 1m) keep their decimals. */
const MAX_DIGITS_FOR_TOTAL_WITH_DECIMALS = 6;

/** Totals with up to this many integer digits (under 10m) show the whole amount, larger ones the compact form. */
const MAX_DIGITS_FOR_WHOLE_TOTAL = 7;

export default function useChartLabelFormats({
    data,
    unit,
    unitPosition = 'left',
    formatValue: formatValueOverride,
    labelSkipInterval = 1,
    labelRotation = 0,
    truncatedLabels,
    fontManager,
}: UseChartLabelFormatsProps) {
    const {numberFormat} = useLocalize();

    const displayUnit = typeof unit === 'string' ? unit : unit?.value;
    const unitToDisplay = fontManager && !canFontRenderText(displayUnit, fontManager) ? (unit as UnitWithFallback)?.fallback : displayUnit;
    const withUnit = (formatted: string) => {
        if (!unitToDisplay) {
            return formatted;
        }
        const separator = unitToDisplay.length > 1 ? ' ' : '';
        if (unitPosition === 'right') {
            return `${formatted}${separator}${unitToDisplay}`;
        }
        // A leading unit goes after the minus sign, so negatives read -$50k rather than $-50k.
        const sign = /^[-\u2212]/.exec(formatted)?.[0] ?? '';
        return `${sign}${unitToDisplay}${separator}${formatted.slice(sign.length)}`;
    };
    const formatValue = (value: number) => formatValueOverride?.(value) ?? withUnit(numberFormat(value));
    const formatCompactValue = (value: number) => formatValueOverride?.(value, {shouldUseCompactNotation: true}) ?? withUnit(numberFormat(value, {notation: 'compact'}).replace('K', 'k'));

    /** Formats the full amount with exactly the given number of decimals. */
    const formatExactValue = (value: number, decimals?: number) =>
        formatValueOverride?.(value) ?? withUnit(numberFormat(value, {minimumFractionDigits: decimals, maximumFractionDigits: decimals}));

    /** Formats a total with decimals under 1m, without them under 10m, and in compact form from 10m up. */
    const formatTotalValue = (value: number, decimals?: number) => {
        if (formatValueOverride) {
            return formatValueOverride(value);
        }
        const integerDigits = Math.trunc(Math.abs(value)).toString().length;
        if (integerDigits <= MAX_DIGITS_FOR_TOTAL_WITH_DECIMALS) {
            return formatExactValue(value, decimals);
        }
        if (integerDigits <= MAX_DIGITS_FOR_WHOLE_TOTAL) {
            return withUnit(numberFormat(value, {maximumFractionDigits: 0}));
        }
        return formatCompactValue(value);
    };

    const formatLabel = (value: number) => {
        const index = Math.round(value);

        if (index % labelSkipInterval !== 0) {
            return '';
        }

        const sourceToUse = labelRotation === LABEL_ROTATIONS.VERTICAL || !truncatedLabels ? data.map((p) => p.label) : truncatedLabels;

        return sourceToUse.at(index) ?? '';
    };

    return {
        formatLabel,
        formatValue,
        formatCompactValue,
        formatExactValue,
        formatTotalValue,
    };
}
