import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Whether each bar's label is drawn below it. Turn off when something outside the chart already names the bars. */
    shouldShowLabels?: boolean;
};

export default BarChartProps;
