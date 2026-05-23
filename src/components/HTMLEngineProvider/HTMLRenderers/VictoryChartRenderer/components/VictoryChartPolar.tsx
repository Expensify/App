import React from 'react';
import {Pie, PolarChart} from 'victory-native';
import {POLAR_COLOR_KEY, POLAR_LABEL_KEY, POLAR_VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import VictoryChartLabels from './VictoryChartLabels';
import VictoryChartLegend from './VictoryChartLegend';

/**
 * Renders the PolarChart (pie) with data, labels, and legend drawn from context.
 */
function VictoryChartPolar() {
    const {polarConfig, labelItems, legendItems} = useVictoryChartContext();

    if (!polarConfig) {
        return null;
    }

    return (
        <PolarChart
            data={polarConfig.data}
            labelKey={POLAR_LABEL_KEY}
            valueKey={POLAR_VALUE_KEY}
            colorKey={POLAR_COLOR_KEY}
        >
            <Pie.Chart
                innerRadius={polarConfig.innerRadius}
                startAngle={polarConfig.startAngle}
                circleSweepDegrees={polarConfig.circleSweepDegrees}
            >
                {() => <Pie.Slice />}
            </Pie.Chart>
            <VictoryChartLabels labelItems={labelItems} />
            <VictoryChartLegend legendItems={legendItems} />
        </PolarChart>
    );
}

VictoryChartPolar.displayName = 'VictoryChartPolar';

export default VictoryChartPolar;
