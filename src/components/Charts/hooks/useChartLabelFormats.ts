import type {ChartDataPoint, LabelRotation, UnitPosition, UnitWithFallback} from '@components/Charts/types';
import {canFontRenderText} from '@components/Charts/utils';
import {LABEL_ROTATIONS} from '@components/Charts/VictoryTheme';

import useLocalize from '@hooks/useLocalize';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

type UseChartLabelFormatsProps = {
    data: ChartDataPoint[];
    unit?: UnitWithFallback | string;
    unitPosition?: UnitPosition;
    labelSkipInterval?: number;
    labelRotation?: LabelRotation;
    truncatedLabels?: string[];
    fontManager?: SkTypefaceFontProvider | null;
};

export default function useChartLabelFormats({data, unit, unitPosition = 'left', labelSkipInterval = 1, labelRotation = 0, truncatedLabels, fontManager}: UseChartLabelFormatsProps) {
    const {numberFormat} = useLocalize();

    const displayUnit = typeof unit === 'string' ? unit : unit?.value;
    const unitToDisplay = fontManager && !canFontRenderText(displayUnit, fontManager) ? (unit as UnitWithFallback)?.fallback : displayUnit;
    const formatValue = (value: number) => {
        const formatted = numberFormat(value);
        if (!unitToDisplay) {
            return formatted;
        }
        const separator = unitToDisplay.length > 1 ? ' ' : '';
        return unitPosition === 'left' ? `${unitToDisplay}${separator}${formatted}` : `${formatted}${separator}${unitToDisplay}`;
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
    };
}
