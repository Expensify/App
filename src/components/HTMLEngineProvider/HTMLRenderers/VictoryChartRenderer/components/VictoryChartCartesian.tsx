import React from 'react';
import {CartesianChart} from 'victory-native';
import {useVictoryChartContext, VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseDomainPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomainPadding';
import getYKey from '../utils/getYKey';
import VictoryChartLabels from './VictoryChartLabels';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian() {
    const {data, xKey, yKeys, xAxis, yAxis, tnode, isValidCartesian} = useVictoryChartContext();

    if (!isValidCartesian) {
        return;
    }

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
            renderOutside={(renderArgs) => (
                <VictoryChartRenderArgsProvider value={renderArgs}>
                    <VictoryChartLabels />
                    <VictoryChartLegend />
                </VictoryChartRenderArgsProvider>
            )}
        >
            {(renderArgs) => (
                <VictoryChartRenderArgsProvider value={renderArgs}>
                    {tnode.children.map((child) => (
                        <VictoryChartSeries
                            key={`${child.tagName ?? 'node'}-${getYKey(child)}`}
                            tnode={child}
                        />
                    ))}
                </VictoryChartRenderArgsProvider>
            )}
        </CartesianChart>
    );
}

VictoryChartCartesian.displayName = 'VictoryChartCartesian';

export default VictoryChartCartesian;
