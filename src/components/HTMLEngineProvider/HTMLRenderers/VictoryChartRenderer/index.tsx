import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import type {VictoryChartRendererProps} from './types';

function VictoryChartRenderer(props: VictoryChartRendererProps) {
    // Victory Chart uses Skia internally and it uses a WASM module that must be loaded before rendering any Skia-based component.
    return (
        <WithSkiaWeb
            getComponent={() => import('./BaseVictoryChartRenderer')}
            componentProps={props}
        />
    );
}

export default VictoryChartRenderer;
