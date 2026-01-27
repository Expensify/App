import {useCallback} from 'react';

type ChartDataPoint = {
    label: string;
};

type UseChartLabelFormatsProps = {
    data: ChartDataPoint[];
    yAxisUnit?: string;
    labelSkipInterval: number;
    labelRotation: number;
    truncatedLabels: string[];
};

export default function useChartLabelFormats({data, yAxisUnit, labelSkipInterval, labelRotation, truncatedLabels}: UseChartLabelFormatsProps) {
    const formatYAxisLabel = useCallback(
        (value: number) => {
            const formatted = value.toLocaleString();
            return yAxisUnit ? `${yAxisUnit}${formatted}` : formatted;
        },
        [yAxisUnit],
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
