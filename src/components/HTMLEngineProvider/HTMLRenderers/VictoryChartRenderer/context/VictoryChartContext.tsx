import React, {createContext, useContext, useMemo} from 'react';
import type {TNode} from 'react-native-render-html';
import type {ChartDataPoint} from '@components/Charts/types';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {CHART_TYPE, LABEL_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import type {BarSeriesConfig, ChartType, ProcessNodeResult, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

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
    barYKeys: YKey[];
    barSeriesConfig: Partial<Record<YKey, BarSeriesConfig>>;
    tooltipData: ChartDataPoint[];
    tooltipKeyToIndex: Record<string, number>;
    chartContentStyles: ReturnType<typeof parseStyles>['nodeStyles'];
    chartContainerStyles: ReturnType<typeof parseStyles>['parentNodeStyles'];
    type: ChartType | null;
};

const VictoryChartContext = createContext<VictoryChartContextValue | null>(null);

function buildTooltipLookup(entries: ProcessNodeResult['barTooltipEntries']): {tooltipData: ChartDataPoint[]; tooltipKeyToIndex: Record<string, number>} {
    const tooltipData: ChartDataPoint[] = entries.map((entry) => ({
        label: entry.label,
        total: entry.total,
        isLabelOnly: entry.isLabelOnly,
    }));

    const tooltipKeyToIndex: Record<string, number> = {};
    entries.forEach((entry, index) => {
        tooltipKeyToIndex[entry.key] = index;
        for (const alias of entry.keyAliases ?? []) {
            tooltipKeyToIndex[alias] = index;
        }
    });

    return {tooltipData, tooltipKeyToIndex};
}

/**
 * Parses the HTML tnode tree into chart config and makes it available to all chart sub-components.
 * Returns null when the chart data is invalid (no data points, or mixed cartesian/polar content).
 */
function VictoryChartProvider({tnode, children}: {tnode: TNode; children: React.ReactNode}) {
    const {regular: regularTypeface} = useChartDefaultTypeface();
    const {
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
        barTooltipEntries,
        barYKeys,
        barSeriesConfig,
    } = processVictoryChartTree(tnode, regularTypeface, null);
    const {nodeStyles: chartContentStyles, parentNodeStyles: chartContainerStyles} = parseStyles(tnode);
    const {tooltipData, tooltipKeyToIndex} = useMemo(() => buildTooltipLookup(barTooltipEntries), [barTooltipEntries]);

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
        barYKeys,
        barSeriesConfig,
        tooltipData,
        tooltipKeyToIndex,
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
