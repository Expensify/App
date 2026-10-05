import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Color every bar is drawn in. Left out, each bar takes a different color from the palette by rank. */
    color?: string;
};

/** Adds the wrapper-resolved orientation. Only the dispatcher receives `isHorizontal`. Callers and bodies use `BarChartProps`. */
type BarChartContentProps = BarChartProps & {
    /** When true, renders horizontal bars (value on the x-axis) instead of the default vertical bars. */
    isHorizontal?: boolean;

    /** When true, the vertical chart may switch to horizontal bars if category labels don't fit even at 45° (narrow layout, beta on). */
    canFallBackToHorizontalBars?: boolean;
};

export type {BarChartProps, BarChartContentProps};
