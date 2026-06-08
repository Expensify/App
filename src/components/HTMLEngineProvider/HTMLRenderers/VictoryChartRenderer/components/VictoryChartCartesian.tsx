import React from 'react';
import {CartesianChart} from 'victory-native';
import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getChartDesignWidth from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartDesignWidth';
import getChartLayoutModeProps from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartLayoutModeProps';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';

type VictoryChartCartesianProps = {
    explicitSize?: {width: number; height: number};
    headless?: boolean;
};

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian({explicitSize, headless}: VictoryChartCartesianProps) {
    const {tnode, data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, isHorizontal, labelItems, legendItems, chartContentStyles} = useVictoryChartContext();
    const designWidth = getChartDesignWidth(explicitSize, chartContentStyles.width);

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
            {...getChartLayoutModeProps(explicitSize, headless)}
            renderOutside={(renderArgs) => {
                const overlayContent = (
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
                                chartWidth={designWidth}
                            />
                        ))}
                    </VictoryChartRenderArgsProvider>
                );

                if (headless) {
                    return overlayContent;
                }

                // Chart font context does not propagate across the Skia renderOutside boundary.
                return <ChartFontsLoaderProvider>{overlayContent}</ChartFontsLoaderProvider>;
            }}
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
