import {useCallback} from 'react';
import type {ChartDataPoint, YAxisUnitPosition} from '@components/Charts/types';

type UseChartLabelFormatsProps = {
    data: ChartDataPoint[];
    yAxisUnit?: string;
    yAxisUnitPosition?: YAxisUnitPosition;
    labelSkipInterval: number;
    labelRotation: number;
    truncatedLabels: string[];
};

export default function useChartLabelFormats({data, yAxisUnit, yAxisUnitPosition = 'left', labelSkipInterval, labelRotation, truncatedLabels}: UseChartLabelFormatsProps) {
    const formatYAxisLabel = useCallback(
        (value: number) => {
            const formatted = value.toLocaleString();
            if (!yAxisUnit) {
                return formatted;
            }
            // Add space for multi-character codes (e.g., "PLN 100") but not for symbols (e.g., "$100")
            const separator = yAxisUnit.length > 1 ? ' ' : '';
            return yAxisUnitPosition === 'left' ? `${yAxisUnit}${separator}${formatted}` : `${formatted}${separator}${yAxisUnit}`;
        },
        [yAxisUnit, yAxisUnitPosition],
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
    };
}
