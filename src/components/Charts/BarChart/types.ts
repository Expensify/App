import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** When true, all bars use the same color. When false (default), each bar uses a different color from the palette. */
    useSingleColor?: boolean;
};

/** Adds the wrapper-resolved orientation. Only the dispatcher receives `isHorizontal`; callers and bodies use `BarChartProps`. */
type BarChartContentProps = BarChartProps & {
    /** When true, renders horizontal bars (value on the x-axis) instead of the default vertical bars. */
    isHorizontal?: boolean;
};

export type {BarChartProps, BarChartContentProps};
