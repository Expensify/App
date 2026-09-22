import SkiaWebChart from '@components/Charts/SkiaWebChart';

import React from 'react';

import type {VictoryChartRendererProps} from './types';

const getBaseVictoryChartRenderer = () => import('./BaseVictoryChartRenderer');

function VictoryChartRenderer(props: VictoryChartRendererProps) {
    // Victory Chart uses Skia internally and it uses a WASM module that must be loaded before rendering any Skia-based component.
    return (
        <SkiaWebChart
            getComponent={getBaseVictoryChartRenderer}
            componentProps={props}
        />
    );
}

VictoryChartRenderer.displayName = 'VictoryChartRenderer';

export default VictoryChartRenderer;
