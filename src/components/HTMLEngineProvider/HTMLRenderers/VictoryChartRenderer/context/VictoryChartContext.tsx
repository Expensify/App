import React, {createContext, useContext} from 'react';
import type {TNode} from 'react-native-render-html';
import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import type {ChartType, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';
import resolveVictoryChartType from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveVictoryChartType';
import Log from '@libs/Log';

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

/**
 * Parses the HTML tnode tree into chart config and makes it available to all chart sub-components.
 * Returns null when the chart data is invalid (no data points, or mixed cartesian/polar content).
 */
function VictoryChartProvider({tnode, children}: {tnode: TNode; children: React.ReactNode}) {
    const typefaces = useChartTypefaces();

    let processedResult: ProcessNodeResult;
    try {
        processedResult = processVictoryChartTree(tnode, typefaces.EXP_NEUE, null);
    } catch (error) {
        // Malformed chart HTML can make a parser throw. Fail closed (render nothing) instead of crashing the whole report.
        Log.warn('[VictoryChartProvider] Failed to process chart tree from malformed HTML', {error});
        return null;
    }

    const {data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, isHorizontal, categories, labelItems, legendItems} = processedResult;
    const {nodeStyles: chartContentStyles, parentNodeStyles: chartContainerStyles} = parseStyles(tnode);
    const type = resolveVictoryChartType(tnode, typefaces.EXP_NEUE);

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

function useVictoryChartContext(): VictoryChartContextValue {
    const context = useContext(VictoryChartContext);
    if (!context) {
        throw new Error('useVictoryChartContext must be used within VictoryChartProvider');
    }
    return context;
}

export {VictoryChartProvider, useVictoryChartContext};
