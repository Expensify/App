import VictoryChartBar from './components/VictoryChartBar';
import VictoryChartCartesian from './components/VictoryChartCartesian';
import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartLabels from './components/VictoryChartLabels';
import VictoryChartLegend from './components/VictoryChartLegend';
import VictoryChartLine from './components/VictoryChartLine';
import VictoryChartSeries from './components/VictoryChartSeries';
import {VictoryChartProvider, VictoryChartRenderArgsProvider} from './context/VictoryChartContext';

const VictoryChart = {
    Provider: VictoryChartProvider,
    RenderArgsProvider: VictoryChartRenderArgsProvider,
    Container: VictoryChartContainer,
    Cartesian: VictoryChartCartesian,
    Series: VictoryChartSeries,
    Bar: VictoryChartBar,
    Line: VictoryChartLine,
    Labels: VictoryChartLabels,
    Legend: VictoryChartLegend,
};

export default VictoryChart;
