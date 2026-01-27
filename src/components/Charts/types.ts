import type IconAsset from '@src/types/utils/IconAsset';

type BarChartDataPoint = {
    /** Label displayed under the bar (e.g., "Amazon", "Travel", "Nov 2025") */
    label: string;

    /** Total amount (pre-formatted, e.g., dollars not cents) */
    total: number;

    /** Currency code for formatting */
    currency: string;

    /** Query string for navigation when bar is clicked (optional) */
    onClickQuery?: string;
};

type BarChartProps = {
    /** Data points to display */
    data: BarChartDataPoint[];

    /** Chart title (e.g., "Top Categories", "Spend by Merchant") */
    title?: string;

    /** Icon displayed next to the title */
    titleIcon?: IconAsset;

    /** Whether data is loading */
    isLoading?: boolean;

    /** Callback when a bar is pressed */
    onBarPress?: (dataPoint: BarChartDataPoint, index: number) => void;

    /** Symbol/unit prefix for Y-axis labels (e.g., '$', '€'). Empty string or undefined shows raw numbers. */
    yAxisUnit?: string;

    /** When true, all bars use the same color. When false (default), each bar uses a different color from the palette. */
    useSingleColor?: boolean;
};

export type {BarChartDataPoint, BarChartProps};
