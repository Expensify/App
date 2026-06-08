import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {PolarChart} from 'victory-native';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {processDataIntoSlices} from '@components/Charts/utils';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import useVictoryChartPieTooltips from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartPieTooltips';
import useVictoryChartTooltipFormatter from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartTooltipFormatter';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import getVictoryPieLayout from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getVictoryPieLayout';
import VictoryChartCategories from './VictoryChartCategories';
import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

type VictoryChartPolarTooltipsProps = {
    chartWidth: number;
    innerRadius: number;
    hitTestRadius: number;
    centerX: number;
    centerY: number;
};

/**
 * Captures hover/tap over the pie chart without wrapping PolarChart itself.
 */
function VictoryChartPolarTooltips({chartWidth, innerRadius, hitTestRadius, centerX, centerY}: VictoryChartPolarTooltipsProps) {
    const {tooltipData} = useVictoryChartContext();
    const formatTooltipValue = useVictoryChartTooltipFormatter();

    const pieGeometry = useMemo(
        () => ({
            centerX,
            centerY,
            radius: hitTestRadius,
        }),
        [centerX, centerY, hitTestRadius],
    );

    const processedSlices = useMemo(() => processDataIntoSlices(tooltipData, pieGeometry, START_ANGLE), [pieGeometry, tooltipData]);

    const {plotGestures, matchedIndex, isTooltipActive, initialTooltipPosition} = useVictoryChartPieTooltips({
        slices: processedSlices,
        pieGeometry,
        innerRadius,
    });

    return (
        <>
            <GestureDetector gesture={plotGestures}>
                <View
                    style={StyleSheet.absoluteFill}
                    pointerEvents="box-only"
                />
            </GestureDetector>
            <ChartTooltipLayer
                matchedIndex={matchedIndex}
                isTooltipActive={isTooltipActive}
                data={tooltipData}
                formatValue={formatTooltipValue}
                chartWidth={chartWidth}
                initialTooltipPosition={initialTooltipPosition}
            />
        </>
    );
}

/**
 * Renders the PolarChart with data drawn from context.
 */
function VictoryChartPolar() {
    const {tnode, data, labelItems, legendItems, tooltipData, chartContentStyles} = useVictoryChartContext();
    const pieNode = tnode.children.find((child) => child.tagName === 'victorypie');
    const chartWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : 0;
    const chartHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : 0;
    const {innerRadius, hitTestRadius, centerX, centerY} = getVictoryPieLayout(pieNode, chartWidth, chartHeight);
    const hasPieTooltips = tooltipData.length > 0;

    return (
        <>
            <PolarChart
                data={Object.values(data)}
                labelKey={LABEL_KEY}
                valueKey={VALUE_KEY}
                colorKey={COLOR_KEY}
            >
                {/* Chart font context does not propagate into polar Skia children. */}
                <ChartFontsLoaderProvider>
                    {tnode.children.map((child) => (
                        <VictoryChartCategories
                            key={`${child.tagName ?? 'node'}-${getHierarchyID(child)}`}
                            tnode={child}
                        />
                    ))}
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
                </ChartFontsLoaderProvider>
            </PolarChart>
            {hasPieTooltips && chartWidth > 0 && chartHeight > 0 && (
                <VictoryChartPolarTooltips
                    chartWidth={chartWidth}
                    innerRadius={innerRadius}
                    hitTestRadius={hitTestRadius}
                    centerX={centerX}
                    centerY={centerY}
                />
            )}
        </>
    );
}

export default VictoryChartPolar;
