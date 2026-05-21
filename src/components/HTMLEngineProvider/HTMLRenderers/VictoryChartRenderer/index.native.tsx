import React from 'react';
import BaseVictoryChartRenderer from './BaseVictoryChartRenderer';
import type {VictoryChartRendererProps} from './types';

function VictoryChartRenderer(props: VictoryChartRendererProps) {
    return <BaseVictoryChartRenderer {...props} />;
}

export default VictoryChartRenderer;
