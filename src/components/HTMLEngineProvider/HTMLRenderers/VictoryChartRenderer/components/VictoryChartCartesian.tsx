import React from 'react';
import {CartesianChart} from 'victory-native';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseDomainPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomainPadding';
import VictoryChart from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/VictoryChart';

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian() {
    const {data, xKey, yKeys, xAxis, yAxis, tnode, labelItems, legendItems, type} = useVictoryChartContext();

    if (type !== CHART_TYPE.CARTESIAN) {
        return null;
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
                <VictoryChart.RenderArgsProvider value={renderArgs}>
                    <VictoryChart.Labels labelItems={labelItems} />
                    <VictoryChart.Legend legendItems={legendItems} />
                </VictoryChart.RenderArgsProvider>
            )}
        >
            {(renderArgs) => (
                <VictoryChart.RenderArgsProvider value={renderArgs}>
                    {tnode.children.map((child) => (
                        <VictoryChart.Series
                            key={`${child.tagName ?? 'node'}-${getYKey(child)}`}
                            tnode={child}
                        />
                    ))}
                </VictoryChart.RenderArgsProvider>
            )}
        </CartesianChart>
    );
}

VictoryChartCartesian.displayName = 'VictoryChartCartesian';

export default VictoryChartCartesian;
