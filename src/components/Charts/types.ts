import type IconAsset from '@src/types/utils/IconAsset';

type ChartDataPoint = {
    /** Label displayed under the data point (e.g., "Amazon", "Nov 2025") */
    label: string;

    /** Total amount (pre-formatted, e.g., dollars not cents) */
    total: number;

    /** Query string for navigation when data point is clicked (optional) */
    onClickQuery?: string;
};

/**
 * Unit with font fallback support.
 * The chart checks if the font can render `value` and uses `fallback` if not.
 */
type UnitWithFallback = {value: string; fallback: string};

/** Position of the unit symbol relative to the formatted value. */
type UnitPosition = 'left' | 'right';

type ChartProps = {
    /** Data points to display */
    data: ChartDataPoint[];

    /** Chart title (e.g., "Top Categories", "Spend over time") */
    title?: string;

    /** Icon displayed next to the title */
    titleIcon?: IconAsset;

    /** Whether data is loading */
    isLoading?: boolean;
};

type CartesianChartProps = ChartProps & {
    /** Symbol/unit for Y-axis labels with font fallback support. */
    yAxisUnit?: UnitWithFallback;

    /** Position of the unit symbol relative to the value. Defaults to 'left'. */
    yAxisUnitPosition?: UnitPosition;
};

type PieSlice = {
    /** Display label for this slice */
    label: string;

    /** Absolute value used for slice sizing */
    value: number;

    /** Hex color assigned based on sorted rank */
    color: string;

    /** Percentage of the total pie this slice represents */
    percentage: number;

    /** Starting angle in degrees (0 = 3 o'clock) */
    startAngle: number;

    /** Ending angle in degrees */
    endAngle: number;

    /** Index in the original unsorted data array, used to map back for tooltips */
    originalIndex: number;
};

export type {ChartDataPoint, ChartProps, CartesianChartProps, PieSlice, UnitPosition, UnitWithFallback};
