import VictoryChartBar from './components/VictoryChartBar';
import VictoryChartCartesian from './components/VictoryChartCartesian';
import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartContent from './components/VictoryChartContent';
import VictoryChartLabels from './components/VictoryChartLabels';
import VictoryChartLegend from './components/VictoryChartLegend';
import VictoryChartLine from './components/VictoryChartLine';
import VictoryChartPolar from './components/VictoryChartPolar';
import VictoryChartSeries from './components/VictoryChartSeries';
import {VictoryChartProvider} from './context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from './context/VictoryChartRenderArgsContext';

const VictoryChart = {
    Provider: VictoryChartProvider,
    RenderArgsProvider: VictoryChartRenderArgsProvider,
    Container: VictoryChartContainer,
    Content: VictoryChartContent,
    Cartesian: VictoryChartCartesian,
    Polar: VictoryChartPolar,
    Series: VictoryChartSeries,
    Bar: VictoryChartBar,
    Line: VictoryChartLine,
    Labels: VictoryChartLabels,
    Legend: VictoryChartLegend,
};

export default VictoryChart;
