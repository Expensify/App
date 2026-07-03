import React from 'react';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import type {VictoryChartRendererProps} from './types';

const getBaseVictoryChartRenderer = () => import('./BaseVictoryChartRenderer');

function VictoryChartRenderer(props: VictoryChartRendererProps) {
    // Victory Chart uses Skia internally and it uses a WASM module that must be loaded before rendering any Skia-based component.
    return (
        <SkiaWebChart
            getComponent={getBaseVictoryChartRenderer}
            componentProps={props}
            reasonContext="VictoryChartRenderer.SkiaWebLoading"
        />
    );
}

VictoryChartRenderer.displayName = 'VictoryChartRenderer';

export default VictoryChartRenderer;
