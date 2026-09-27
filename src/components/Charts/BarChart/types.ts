import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Color every bar is drawn in. Left out, each bar takes a different color from the palette by rank. */
    color?: string;
};

/** Adds the width the wrapper measured. Bodies receive it. Callers use `BarChartProps`. */
type BarChartBodyProps = BarChartProps & {
    chartWidth: number;
};

/** Adds the wrapper-resolved orientation. Only the dispatcher receives `isHorizontal`. */
type BarChartContentProps = BarChartBodyProps & {
    /** When true, renders horizontal bars (value on the x-axis) instead of the default vertical bars. */
    isHorizontal?: boolean;
};

export type {BarChartProps, BarChartBodyProps, BarChartContentProps};
