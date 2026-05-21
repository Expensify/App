import React from 'react';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import BaseVictoryChartRenderer from './BaseVictoryChartRenderer';

function VictoryChartRenderer(props: CustomRendererProps<TBlock>) {
    return <BaseVictoryChartRenderer {...props} />;
}

export default VictoryChartRenderer;
