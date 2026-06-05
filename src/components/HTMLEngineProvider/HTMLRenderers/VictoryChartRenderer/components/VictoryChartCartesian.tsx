import React, {useCallback, useRef} from 'react';
import type {CartesianChartRenderArg, Scale} from 'victory-native';
import {CartesianChart} from 'victory-native';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import {useVictoryChartBarTooltips} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import type {CartesianChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import buildBarHitTargets from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/buildBarHitTargets';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';

function formatTooltipValue(value: number): string {
    return `$${Math.round(value).toLocaleString()}`;
}

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian() {
    const {
        tnode,
        data,
        xKey,
        yKeys,
        xAxis,
        yAxis,
        domain,
        domainPadding,
        padding,
        isHorizontal,
        categories,
        labelItems,
        legendItems,
        barYKeys,
        barSeriesConfig,
        barGroupLayouts,
        tooltipData,
        tooltipKeyToIndex,
        chartContentStyles,
    } = useVictoryChartContext();
    const renderArgsRef = useRef<CartesianChartRenderArg<CartesianChartData, YKey> | null>(null);
    const hasBarTooltips = barYKeys.length > 0 && tooltipData.length > 0;
    const chartWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : 0;
    const {plotGestures, updateHitTargets, matchedIndex, isTooltipActive, initialTooltipPosition} = useVictoryChartBarTooltips();

    const syncHitTargets = useCallback(
        (xScale: Scale, yScale: Scale) => {
            const renderArgs = renderArgsRef.current;
            if (!hasBarTooltips || !renderArgs) {
                return;
            }

            const valueAxisZero = isHorizontal ? xScale(0) : yScale(0);
            updateHitTargets(
                buildBarHitTargets({
                    points: renderArgs.points,
                    barYKeys,
                    barSeriesConfig,
                    barGroupLayouts,
                    tooltipKeyToIndex,
                    isHorizontal: isHorizontal ?? false,
                    categories,
                    valueAxisZero,
                }),
            );
        },
        [barGroupLayouts, barSeriesConfig, barYKeys, categories, hasBarTooltips, isHorizontal, tooltipKeyToIndex, updateHitTargets],
    );

    return (
        <>
            <CartesianChart
                data={Object.values(data)}
                xKey={xKey}
                yKeys={yKeys}
                xAxis={xAxis}
                yAxis={yAxis}
                domain={domain}
                domainPadding={domainPadding}
                padding={padding}
                customGestures={hasBarTooltips ? plotGestures : undefined}
                onScaleChange={hasBarTooltips ? syncHitTargets : undefined}
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
                                />
                            ))}
                        </VictoryChartRenderArgsProvider>
                    </ChartFontsLoaderProvider>
                )}
            >
                {(renderArgs) => {
                    renderArgsRef.current = renderArgs;

                    return (
                        <VictoryChartRenderArgsProvider value={renderArgs}>
                            {tnode.children.map((child) => (
                                <VictoryChartSeries
                                    key={`${child.tagName ?? 'node'}-${getHierarchyID(child)}`}
                                    tnode={child}
                                    isHorizontal={isHorizontal}
                                />
                            ))}
                        </VictoryChartRenderArgsProvider>
                    );
                }}
            </CartesianChart>
            {hasBarTooltips && chartWidth > 0 && (
                <ChartTooltipLayer
                    matchedIndex={matchedIndex}
                    isTooltipActive={isTooltipActive}
                    data={tooltipData}
                    formatValue={formatTooltipValue}
                    chartWidth={chartWidth}
                    initialTooltipPosition={initialTooltipPosition}
                />
            )}
        </>
    );
}

export default VictoryChartCartesian;
