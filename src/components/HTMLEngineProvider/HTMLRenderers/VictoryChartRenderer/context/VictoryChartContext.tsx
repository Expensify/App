import type {ChartType, LabelItem, LegendItem, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computeAdjustedOverlayY from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeAdjustedOverlayY';
import computeDynamicChartHeight from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeDynamicChartHeight';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

import type {TNode} from 'react-native-render-html';

import React, {createContext, useContext} from 'react';

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
    type: ChartType;
};

const VictoryChartContext = createContext<VictoryChartContextValue | null>(null);

type VictoryChartProviderProps = {
    tnode: TNode;
    processedResult: ProcessNodeResult;
    type: ChartType;
    children: React.ReactNode;
};

/** Supplies parsed chart config to chart sub-components. Callers must parse and validate the tnode first. */
function VictoryChartProvider({tnode, processedResult, type, children}: VictoryChartProviderProps) {
    const {data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, isHorizontal, categories, labelItems, legendItems} = processedResult;
    const {nodeStyles: chartContentStyles, parentNodeStyles: chartContainerStyles} = parseStyles(tnode);
    const parsedDesignHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const itemCount = categories?.length ?? Object.keys(data).length;
    const effectiveChartHeight = computeDynamicChartHeight({
        designHeight: parsedDesignHeight,
        isHorizontal,
        itemCount,
        padding,
    });
    const heightDelta = parsedDesignHeight !== undefined && effectiveChartHeight !== undefined ? parsedDesignHeight - effectiveChartHeight : 0;
    const effectiveChartContentStyles = heightDelta > 0 ? {...chartContentStyles, height: effectiveChartHeight} : chartContentStyles;
    const effectiveLabelItems: LabelItem[] =
        heightDelta > 0 ? labelItems.map((labelItem) => ({...labelItem, y: computeAdjustedOverlayY(labelItem.y, effectiveChartHeight, heightDelta)})) : labelItems;
    const effectiveLegendItems: LegendItem[] =
        heightDelta > 0 ? legendItems.map((legendItem) => ({...legendItem, y: computeAdjustedOverlayY(legendItem.y, effectiveChartHeight, heightDelta)})) : legendItems;

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
        labelItems: effectiveLabelItems,
        legendItems: effectiveLegendItems,
        chartContentStyles: effectiveChartContentStyles,
        chartContainerStyles,
        type,
    };

    return <VictoryChartContext.Provider value={contextValue}>{children}</VictoryChartContext.Provider>;
}

function useVictoryChartContext(): VictoryChartContextValue {
    const context = useContext(VictoryChartContext);
    if (!context) {
        throw new Error('useVictoryChartContext must be used within VictoryChartProvider');
    }
    return context;
}

export {VictoryChartProvider, useVictoryChartContext};
