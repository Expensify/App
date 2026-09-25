import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    /** Called with the pressed point and the series whose bar was pressed */
    onBarPress?: (dataPoint: ChartDataPoint, index: number, seriesKey: string) => void;

    /** Color every bar is drawn in. Left out, each bar takes a different color from the palette by rank. */
    color?: string;
};

/** Adds the wrapper-resolved orientation. Only the dispatcher receives `isHorizontal`. Callers and bodies use `BarChartProps`. */
type BarChartContentProps = BarChartProps & {
    /** When true, renders horizontal bars (value on the x-axis) instead of the default vertical bars. */
    isHorizontal?: boolean;
};

export type {BarChartProps, BarChartContentProps};
