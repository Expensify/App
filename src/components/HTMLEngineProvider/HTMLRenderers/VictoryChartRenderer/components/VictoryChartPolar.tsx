import React from 'react';
import {Pie, PolarChart} from 'victory-native';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import VictoryChartPie from './VictoryChartPie';

/**
 * Renders the PolarChart with data drawn from context.
 */
function VictoryChartPolar() {
    const {data} = useVictoryChartContext();

    return (
        <PolarChart
            data={Object.values(data)}
            labelKey={LABEL_KEY}
            valueKey={VALUE_KEY}
            colorKey={COLOR_KEY}
        >
            <VictoryChartPie />
        </PolarChart>
    );
}

VictoryChartPolar.displayName = 'VictoryChartPolar';

export default VictoryChartPolar;
