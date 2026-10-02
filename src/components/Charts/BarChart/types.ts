import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    /** Called with the pressed point and the series whose bar was pressed */
    onBarPress?: (dataPoint: ChartDataPoint, index: number, seriesKey: string) => void;
};

/** Adds the wrapper-resolved orientation. Only the dispatcher receives `isHorizontal`. Callers and bodies use `BarChartProps`. */
type BarChartContentProps = BarChartProps & {
    /** When true, renders horizontal bars (value on the x-axis) instead of the default vertical bars. */
    isHorizontal?: boolean;
};

export type {BarChartProps, BarChartContentProps};
