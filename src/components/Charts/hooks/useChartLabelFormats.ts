import {LABEL_ROTATIONS} from '@components/Charts/constants';
import type {ChartDataPoint, LabelRotation, UnitPosition, UnitWithFallback} from '@components/Charts/types';
import useLocalize from '@hooks/useLocalize';

type UseChartLabelFormatsProps = {
    data: ChartDataPoint[];
    unit?: UnitWithFallback | string;
    unitPosition?: UnitPosition;
    labelSkipInterval?: number;
    labelRotation?: LabelRotation;
    truncatedLabels?: string[];
};

export default function useChartLabelFormats({data, unit, unitPosition = 'left', labelSkipInterval = 1, labelRotation = 0, truncatedLabels}: UseChartLabelFormatsProps) {
    const {numberFormat} = useLocalize();

    const displayUnit = typeof unit === 'string' ? unit : unit?.value;

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

        const sourceToUse = labelRotation === LABEL_ROTATIONS.VERTICAL || !truncatedLabels ? data.map((p) => p.label) : truncatedLabels;

        return sourceToUse.at(index) ?? '';
    };

    return {
        formatLabel,
        formatValue,
    };
}
