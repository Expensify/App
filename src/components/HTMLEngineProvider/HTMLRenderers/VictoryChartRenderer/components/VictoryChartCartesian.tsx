import React, {useCallback, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {Scale} from 'victory-native';
import {CartesianChart} from 'victory-native';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import VictoryChartBarHitTargetsUpdater from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartBarHitTargetsUpdater';
import {useVictoryChartBarTooltips} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const styles = useThemeStyles();
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
        labelItems,
        legendItems,
        barYKeys,
        tooltipData,
    } = useVictoryChartContext();
    const [chartWidth, setChartWidth] = useState(0);
    const [valueAxisZero, setValueAxisZero] = useState(0);
    const hasBarTooltips = barYKeys.length > 0 && tooltipData.length > 0;
    const {plotGestures, updateHitTargets, matchedIndex, isTooltipActive, initialTooltipPosition} = useVictoryChartBarTooltips();

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    }, []);

    const handleScaleChange = useCallback(
        (xScale: Scale, yScale: Scale) => {
            setValueAxisZero(isHorizontal ? xScale(0) : yScale(0));
        },
        [isHorizontal],
    );

    return (
        <Animated.View
            style={styles.chartContent}
            onLayout={handleLayout}
        >
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
                onScaleChange={hasBarTooltips ? handleScaleChange : undefined}
                renderOutside={(renderArgs) => (
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
                )}
            >
                {(renderArgs) => (
                    <VictoryChartRenderArgsProvider value={renderArgs}>
                        {hasBarTooltips && (
                            <VictoryChartBarHitTargetsUpdater
                                valueAxisZero={valueAxisZero}
                                updateHitTargets={updateHitTargets}
                            />
                        )}
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
            {hasBarTooltips && chartWidth > 0 && (
                <View
                    pointerEvents="none"
                    style={styles.chartContent}
                >
                    <ChartTooltipLayer
                        matchedIndex={matchedIndex}
                        isTooltipActive={isTooltipActive}
                        data={tooltipData}
                        formatValue={formatTooltipValue}
                        chartWidth={chartWidth}
                        initialTooltipPosition={initialTooltipPosition}
                    />
                </View>
            )}
        </Animated.View>
    );
}

VictoryChartCartesian.displayName = 'VictoryChartCartesian';

export default VictoryChartCartesian;
