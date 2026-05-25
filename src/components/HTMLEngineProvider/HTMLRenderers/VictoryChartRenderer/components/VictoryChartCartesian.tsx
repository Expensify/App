import React from 'react';
import {CartesianChart} from 'victory-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import VictoryChartLabels from './VictoryChartLabels';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian() {
    const {tnode, data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, labelItems, legendItems} = useVictoryChartContext();

    return (
        <CartesianChart
            data={Object.values(data)}
            xKey={xKey}
            yKeys={yKeys}
            xAxis={xAxis}
            yAxis={yAxis}
            domain={domain}
            domainPadding={domainPadding}
            padding={padding}
            renderOutside={(renderArgs) => (
                <VictoryChartRenderArgsProvider value={renderArgs}>
                    <VictoryChartLabels labelItems={labelItems} />
                    <VictoryChartLegend legendItems={legendItems} />
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
