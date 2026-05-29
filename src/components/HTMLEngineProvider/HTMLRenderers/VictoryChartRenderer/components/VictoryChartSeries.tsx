import React from 'react';
import type {TNode} from 'react-native-render-html';
import VictoryChartBar from './VictoryChartBar';
import VictoryChartBarGroup from './VictoryChartBarGroup';
import VictoryChartLine from './VictoryChartLine';

type VictoryChartSeriesProps = {
    tnode: TNode;
    isHorizontal?: boolean;
};

type SeriesComponent = (props: VictoryChartSeriesProps) => React.ReactElement | null;

/**
 * Dispatches a chart child node to its series renderer based on the HTML tag name.
 * To support a new series type, add its tag name here and create the renderer component.
 */
const SERIES_RENDERERS: Partial<Record<string, SeriesComponent>> = {
    victorybar: VictoryChartBar,
    victorygroup: VictoryChartBarGroup,
    victoryline: VictoryChartLine,
};

function VictoryChartSeries({tnode, isHorizontal}: VictoryChartSeriesProps) {
    const SeriesRenderer = SERIES_RENDERERS[tnode.tagName ?? ''];

    if (!SeriesRenderer) {
        return null;
    }

    return (
        <SeriesRenderer
            tnode={tnode}
            isHorizontal={isHorizontal}
        />
    );
}

VictoryChartSeries.displayName = 'VictoryChartSeries';

export default VictoryChartSeries;
