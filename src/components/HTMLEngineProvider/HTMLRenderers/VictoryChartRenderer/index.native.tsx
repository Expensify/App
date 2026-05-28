import React from 'react';
import BaseVictoryChartRenderer from './BaseVictoryChartRenderer';
import type {VictoryChartRendererProps} from './types';

function VictoryChartRenderer(props: VictoryChartRendererProps) {
    return <BaseVictoryChartRenderer {...props} />;
}

VictoryChartRenderer.displayName = 'VictoryChartRenderer';

export default VictoryChartRenderer;
