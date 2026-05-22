import React from 'react';
import type {CartesianChartRenderArg} from 'victory-native';
import {CartesianChart} from 'victory-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {CartesianChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseDomainPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomainPadding';
import VictoryChartLabels from './VictoryChartLabels';
import VictoryChartLegend from './VictoryChartLegend';

type VictoryChartCartesianProps = {
    children: (renderArgs: CartesianChartRenderArg<CartesianChartData, YKey>) => React.ReactNode;
};

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian({children}: VictoryChartCartesianProps) {
    const {data, xKey, yKeys, xAxis, yAxis, tnode} = useVictoryChartContext();
    return (
        <CartesianChart
            data={Object.values(data)}
            xKey={xKey}
            yKeys={yKeys}
            xAxis={xAxis}
            yAxis={yAxis}
            domain={parseAttribute(tnode.attributes.domain)}
            domainPadding={parseDomainPadding(tnode.attributes.domainpadding)}
            padding={parseAttribute(tnode.attributes.padding)}
            renderOutside={() => (
                <>
                    <VictoryChartLabels />
                    <VictoryChartLegend />
                </>
            )}
        >
            {children}
        </CartesianChart>
    );
}

VictoryChartCartesian.displayName = 'VictoryChartCartesian';

export default VictoryChartCartesian;
