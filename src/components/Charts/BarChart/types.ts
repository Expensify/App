import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Whether each bar's label is drawn below it. Turn off when something outside the chart already names the bars. */
    shouldShowLabels?: boolean;

    /** Draws every bar in this color. Left out, each bar takes its color from the palette by position. */
    color?: string;
};

type BarChartContentProps = BarChartProps & {
    /** Null until the card has been measured. */
    chartWidth: number | null;
};

export default BarChartProps;
export type {BarChartContentProps};
