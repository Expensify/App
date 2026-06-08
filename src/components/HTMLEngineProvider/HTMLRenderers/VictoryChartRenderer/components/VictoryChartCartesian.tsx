import React from 'react';
import {CartesianChart} from 'victory-native';
import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian() {
    const {tnode, data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, isHorizontal, labelItems, legendItems, chartContentStyles} = useVictoryChartContext();
    const chartWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;

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
                // Chart font context does not propagate across the Skia renderOutside boundary.
                <ChartFontsLoaderProvider>
                    <VictoryChartRenderArgsProvider value={renderArgs}>
                        {labelItems.map((labelItem) => (
                            <VictoryChartLabel
                                key={`label-${labelItem.x}-${labelItem.y}`}
                                {...labelItem}
                            />
                        ))}
                        {legendItems.map((legendItem) => (
                            <VictoryChartLegend
                                key={`legend-${legendItem.x}-${legendItem.y}`}
                                {...legendItem}
                                chartWidth={chartWidth}
                            />
                        ))}
                    </VictoryChartRenderArgsProvider>
                </ChartFontsLoaderProvider>
            )}
        >
            {(renderArgs) => (
                <VictoryChartRenderArgsProvider value={renderArgs}>
                    {tnode.children.map((child) => (
                        <VictoryChartSeries
                            key={`${child.tagName ?? 'node'}-${getHierarchyID(child)}`}
                            tnode={child}
                            isHorizontal={isHorizontal}
                        />
                    ))}
                </VictoryChartRenderArgsProvider>
            )}
        </CartesianChart>
    );
}

export default VictoryChartCartesian;
