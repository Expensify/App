import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';

function VictoryChartRenderer(props: CustomRendererProps<TBlock>) {
    return (
        <WithSkiaWeb
            getComponent={() => import('./BaseVictoryChartRenderer')}
            componentProps={props}
        />
    );
}

export default VictoryChartRenderer;
