import React from 'react';

import type {VictoryChartRendererProps} from './types';

import BaseVictoryChartRenderer from './BaseVictoryChartRenderer';

function VictoryChartRenderer(props: VictoryChartRendererProps) {
    return <BaseVictoryChartRenderer {...props} />;
}

VictoryChartRenderer.displayName = 'VictoryChartRenderer';

export default VictoryChartRenderer;
