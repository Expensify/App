import React, {useMemo} from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {PolarChart} from 'victory-native';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
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

    const pieGeometry = useMemo(
        () => ({
            centerX: chartWidth / 2,
            centerY: chartHeight / 2,
            radius: outerRadius,
        }),
        [chartHeight, chartWidth, outerRadius],
    );

    const processedSlices = useMemo(() => {
        if (!hasPieTooltips || chartWidth === 0 || chartHeight === 0) {
            return [];
        }

        return processDataIntoSlices(tooltipData, pieGeometry, START_ANGLE);
    }, [chartHeight, chartWidth, hasPieTooltips, pieGeometry, tooltipData]);

    const {plotGestures, matchedIndex, isTooltipActive, initialTooltipPosition} = useVictoryChartPieTooltips({
        slices: processedSlices,
        pieGeometry,
        innerRadius,
    });

    const chartContent = (
        <PolarChart
            data={Object.values(data)}
            labelKey={LABEL_KEY}
            valueKey={VALUE_KEY}
            colorKey={COLOR_KEY}
        >
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
        </PolarChart>
    );

    return (
        <>
            {hasPieTooltips ? (
                <GestureDetector gesture={plotGestures}>
                    <View style={{width: chartWidth || '100%', height: chartHeight || '100%'}}>{chartContent}</View>
                </GestureDetector>
            ) : (
                chartContent
            )}
            {hasPieTooltips && chartWidth > 0 && (
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

VictoryChartPolar.displayName = 'VictoryChartPolar';

export default VictoryChartPolar;
