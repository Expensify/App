import type IconAsset from '@src/types/utils/IconAsset';

type ChartDataPoint = {
    /** Label displayed under the data point (e.g., "Amazon", "Nov 2025") */
    label: string;

    /** Total amount (pre-formatted, e.g., dollars not cents) */
    total: number;

    /** Query string for navigation when data point is clicked (optional) */
    onClickQuery?: string;
};

type CartesianChartProps = {
    /** Data points to display */
    data: ChartDataPoint[];

    /** Chart title (e.g., "Top Categories", "Spend over time") */
    title?: string;

    /** Icon displayed next to the title */
    titleIcon?: IconAsset;

    /** Whether data is loading */
    isLoading?: boolean;

    /** Symbol/unit for Y-axis labels (e.g., '$', '€', 'zł'). Empty string or undefined shows raw numbers. */
    yAxisUnit?: string;

    /** Position of the unit symbol relative to the value. Defaults to 'left'. */
    yAxisUnitPosition?: YAxisUnitPosition;
};

type YAxisUnitPosition = 'left' | 'right';

export type {ChartDataPoint, CartesianChartProps, YAxisUnitPosition};
