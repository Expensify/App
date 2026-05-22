import React from 'react';
import type {TNode} from 'react-native-render-html';
import VictoryChartBar from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartBar';
import VictoryChartLine from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartLine';
import Log from '@libs/Log';

type VictoryChartSeriesProps = {tnode: TNode};

type SeriesComponent = (props: VictoryChartSeriesProps) => React.ReactElement | null;

/**
 * Dispatches a chart child node to its series renderer based on the HTML tag name.
 * To support a new series type, add its tag name here and create the renderer component.
 */
const SERIES_RENDERERS: Partial<Record<string, SeriesComponent>> = {
    victorybar: VictoryChartBar,
    victoryline: VictoryChartLine,
};

function VictoryChartSeries({tnode}: VictoryChartSeriesProps) {
    const SeriesRenderer = SERIES_RENDERERS[tnode.tagName ?? ''];
    if (!SeriesRenderer) {
        Log.warn('Trying to render an unsupported series chart', {tagName: tnode.tagName});
        return null;
    }
    return <SeriesRenderer tnode={tnode} />;
}

VictoryChartSeries.displayName = 'VictoryChartSeries';

export default VictoryChartSeries;
