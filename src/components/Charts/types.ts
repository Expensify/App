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

    /** Symbol/unit for Y-axis labels (e.g., '$', '€', 'zł'). Empty string or undefined shows raw numbers. */
    yAxisUnit?: string;

    /** Position of the unit symbol relative to the value. Defaults to 'left'. */
    yAxisUnitPosition?: 'left' | 'right';

    /** When true, all bars use the same color. When false (default), each bar uses a different color from the palette. */
    useSingleColor?: boolean;
};

type PieChartDataPoint = {
    /** Label displayed for the slice (e.g., "Amazon", "Travel") */
    label: string;

    /** Numeric value for the slice (e.g., display amount) */
    value: number;

    /** Currency code for formatting */
    currency: string;

    /** Query string for navigation when slice is clicked (optional) */
    onClickQuery?: string;
};

type PieChartProps = {
    /** Data points to display */
    data: PieChartDataPoint[];

    /** Chart title (e.g., "Top Categories", "Spend by Merchant") */
    title?: string;

    /** Icon displayed next to the title */
    titleIcon?: IconAsset;

    /** Whether data is loading */
    isLoading?: boolean;

    /** Callback when a slice is pressed */
    onSlicePress?: (dataPoint: PieChartDataPoint, index: number) => void;

    /** Symbol/unit for value labels in tooltip (e.g., '$', '€'). */
    valueUnit?: string;
};

export type { BarChartDataPoint, BarChartProps, PieChartDataPoint, PieChartProps };
