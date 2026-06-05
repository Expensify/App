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
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import VictoryChartCategories from './VictoryChartCategories';
import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

function formatTooltipValue(value: number): string {
    return `$${Math.round(value).toLocaleString()}`;
}

type VictoryChartPolarTooltipsProps = {
    chartWidth: number;
    chartHeight: number;
    innerRadius: number;
    outerRadius: number;
};

/**
 * Captures hover/tap over the pie chart without wrapping PolarChart itself.
 */
function VictoryChartPolarTooltips({chartWidth, chartHeight, innerRadius, outerRadius}: VictoryChartPolarTooltipsProps) {
    const {tooltipData} = useVictoryChartContext();

    const pieGeometry = useMemo(
        () => ({
            centerX: chartWidth / 2,
            centerY: chartHeight / 2,
            radius: outerRadius,
        }),
        [chartHeight, chartWidth, outerRadius],
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
                    style={StyleSheet.absoluteFillObject}
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
    const outerRadius = pieNode?.attributes.radius !== undefined ? Number(parseAttribute(pieNode.attributes.radius)) : Math.min(chartWidth, chartHeight) / 2;
    const innerRadius = pieNode?.attributes.innerradius !== undefined ? Number(parseAttribute(pieNode.attributes.innerradius)) : 0;
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
                    chartHeight={chartHeight}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                />
            )}
        </>
    );
}

export default VictoryChartPolar;
