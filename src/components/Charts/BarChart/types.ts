import type {CartesianChartProps, ChartDataPoint} from '..';

type BarChartProps = CartesianChartProps & {
    /** Called with the pressed point and the series whose bar was pressed */
    onBarPress?: (dataPoint: ChartDataPoint, index: number, seriesKey: string) => void;

    /** Whether each bar's label is drawn below it. Turn off when something outside the chart already names the bars. */
    shouldShowLabels?: boolean;
};

export default BarChartProps;
