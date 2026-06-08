import React, {createContext, useContext} from 'react';
import type {TNode} from 'react-native-render-html';
import type {ChartDataPoint} from '@components/Charts/types';
import type {BarGroupLayout, BarSeriesConfig, ChartType, ProcessNodeResult, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
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
    barGroupLayouts: BarGroupLayout[];
    tooltipData: ChartDataPoint[];
    tooltipKeyToIndex: Record<string, number>;
    chartContentStyles: ReturnType<typeof parseStyles>['nodeStyles'];
    chartContainerStyles: ReturnType<typeof parseStyles>['parentNodeStyles'];
    type: ChartType;
};

const VictoryChartContext = createContext<VictoryChartContextValue | null>(null);

function buildBarTooltipLookup(entries: ProcessNodeResult['barTooltipEntries']): {tooltipData: ChartDataPoint[]; tooltipKeyToIndex: Record<string, number>} {
    const tooltipData: ChartDataPoint[] = entries.map((entry) => ({
        label: entry.label,
        total: entry.total,
        isLabelOnly: entry.isLabelOnly,
    }));

    const tooltipKeyToIndex: Record<string, number> = {};
    for (const [index, entry] of entries.entries()) {
        tooltipKeyToIndex[entry.key] = index;
        for (const alias of entry.keyAliases ?? []) {
            tooltipKeyToIndex[alias] = index;
        }
    }

    return {tooltipData, tooltipKeyToIndex};
}

function buildPieTooltipData(entries: ProcessNodeResult['pieTooltipEntries']): ChartDataPoint[] {
    return entries.map((entry) => ({
        label: entry.label,
        total: entry.total,
        isLabelOnly: entry.isLabelOnly,
    }));
}

type VictoryChartProviderProps = {
    tnode: TNode;
    processedResult: ProcessNodeResult;
    type: ChartType;
    children: React.ReactNode;
};

/** Supplies parsed chart config to chart sub-components. Callers must parse and validate the tnode first. */
function VictoryChartProvider({tnode, processedResult, type, children}: VictoryChartProviderProps) {
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
        barGroupLayouts,
        pieTooltipEntries,
    } = processedResult;
    const {nodeStyles: chartContentStyles, parentNodeStyles: chartContainerStyles} = parseStyles(tnode);

    const {tooltipData, tooltipKeyToIndex} =
        barTooltipEntries.length > 0
            ? buildBarTooltipLookup(barTooltipEntries)
            : {
                  tooltipData: buildPieTooltipData(pieTooltipEntries),
                  tooltipKeyToIndex: {},
              };

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
        barGroupLayouts,
        tooltipData,
        tooltipKeyToIndex,
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
