import React, {createContext, useContext} from 'react';
import type {TNode} from 'react-native-render-html';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {CHART_TYPE, LABEL_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import type {ChartType, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

const DEFAULT_LEGEND_FONT_SIZE = 14;
const LEGEND_AXIS_GAP = 12;

type VictoryChartContextValue = {
    tnode: TNode;
    data: ProcessNodeResult['data'];
    xKey: ProcessNodeResult['xKey'];
    yKeys: ProcessNodeResult['yKeys'];
    xAxis: ProcessNodeResult['xAxis'];
    yAxis: ProcessNodeResult['yAxis'];
    domain: ProcessNodeResult['domain'];
    domainPadding: ProcessNodeResult['domainPadding'];
    padding: ProcessNodeResult['padding'];
    isHorizontal: ProcessNodeResult['isHorizontal'];
    categories: ProcessNodeResult['categories'];
    labelItems: ProcessNodeResult['labelItems'];
    legendItems: ProcessNodeResult['legendItems'];
    chartContentStyles: ReturnType<typeof parseStyles>['nodeStyles'];
    chartContainerStyles: ReturnType<typeof parseStyles>['parentNodeStyles'];
    type: ChartType | null;
};

const VictoryChartContext = createContext<VictoryChartContextValue | null>(null);

function getPaddingBottom(padding: ProcessNodeResult['padding']): number {
    if (typeof padding === 'number') {
        return padding;
    }
    return padding?.bottom ?? 0;
}

function getLegendHeight(legendItem: ProcessNodeResult['legendItems'][number]): number {
    return legendItem.entries.reduce((maxHeight, entry) => {
        const symbolHeight = (entry.symbolSize ?? 0) * 2;
        const textHeight = entry.fontSize ?? DEFAULT_LEGEND_FONT_SIZE;
        return Math.max(maxHeight, symbolHeight, textHeight);
    }, 0);
}

function reserveLegendBottomPadding({
    chartHeight,
    isHorizontal,
    legendItems,
    padding,
}: {
    chartHeight: number | undefined;
    isHorizontal: ProcessNodeResult['isHorizontal'];
    legendItems: ProcessNodeResult['legendItems'];
    padding: ProcessNodeResult['padding'];
}): ProcessNodeResult['padding'] {
    if (!chartHeight || isHorizontal || legendItems.length === 0) {
        return padding;
    }

    const requiredBottomPadding = legendItems.reduce((maxPadding, legendItem) => {
        if (legendItem.y < chartHeight / 2) {
            return maxPadding;
        }

        const legendHeight = getLegendHeight(legendItem);
        const distanceFromBottom = chartHeight - legendItem.y;
        return Math.max(maxPadding, Math.ceil(distanceFromBottom + legendHeight + LEGEND_AXIS_GAP));
    }, getPaddingBottom(padding));

    if (typeof padding === 'number') {
        return Math.max(padding, requiredBottomPadding);
    }

    return {...padding, bottom: requiredBottomPadding};
}

/**
 * Parses the HTML tnode tree into chart config and makes it available to all chart sub-components.
 * Returns null when the chart data is invalid (no data points, or mixed cartesian/polar content).
 */
function VictoryChartProvider({tnode, children}: {tnode: TNode; children: React.ReactNode}) {
    const {regular: regularTypeface} = useChartDefaultTypeface();
    const {nodeStyles: chartContentStyles, parentNodeStyles: chartContainerStyles} = parseStyles(tnode);
    const {
        data,
        xKey,
        yKeys,
        xAxis,
        yAxis,
        domain,
        domainPadding,
        padding: parsedPadding,
        isHorizontal,
        categories,
        labelItems,
        legendItems,
    } = processVictoryChartTree(tnode, regularTypeface, null);
    const padding = reserveLegendBottomPadding({
        chartHeight: typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined,
        isHorizontal,
        legendItems,
        padding: parsedPadding,
    });

    const hasCartesianData = Object.values(data).some((entry) => X_KEY in entry);
    const hasPolarData = Object.values(data).some((entry) => LABEL_KEY in entry);
    let type: ChartType | null = null;

    // XNOR Check. There must be one and only one valid chart
    if (hasCartesianData === hasPolarData) {
        type = null;
    } else if (hasCartesianData) {
        type = CHART_TYPE.CARTESIAN;
    } else if (hasPolarData) {
        type = CHART_TYPE.POLAR;
    }

    if (!type) {
        return null;
    }

    const contextValue: VictoryChartContextValue = {
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
        chartContentStyles,
        chartContainerStyles,
        type,
    };

    return <VictoryChartContext.Provider value={contextValue}>{children}</VictoryChartContext.Provider>;
}

VictoryChartProvider.displayName = 'VictoryChartProvider';

function useVictoryChartContext(): VictoryChartContextValue {
    const context = useContext(VictoryChartContext);
    if (!context) {
        throw new Error('useVictoryChartContext must be used within VictoryChartProvider');
    }
    return context;
}

export {VictoryChartProvider, useVictoryChartContext};
