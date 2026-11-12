import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Whether each bar's label is drawn below it. Turn off when something outside the chart already names the bars. */
    shouldShowLabels?: boolean;

    /** Whether each bar's label wraps to two centered lines beneath its column instead of the single-line axis treatment (rotation/skip). Used for named bars (merchants, categories, spenders). */
    shouldWrapLabels?: boolean;
};

type BarChartContentProps = BarChartProps & {
    /** Null until the card has been measured. */
    chartWidth: number | null;
};

export default BarChartProps;
export type {BarChartContentProps};
