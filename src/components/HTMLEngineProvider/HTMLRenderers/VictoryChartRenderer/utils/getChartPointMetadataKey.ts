import type {RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

function getChartPointMetadataKey(xValue: RawChartData['x']): string {
    return `${typeof xValue}:${String(xValue)}`;
}

export default getChartPointMetadataKey;
