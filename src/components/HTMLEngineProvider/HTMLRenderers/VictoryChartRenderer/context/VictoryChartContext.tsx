import React, {createContext, useContext, useMemo} from 'react';
import type {TNode} from 'react-native-render-html';
import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import type {ChartDataPoint} from '@components/Charts/types';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import type {BarGroupLayout, BarSeriesConfig, ChartType, ProcessNodeResult, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
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
    barYKeys: YKey[];
    barSeriesConfig: Partial<Record<YKey, BarSeriesConfig>>;
    barGroupLayouts: BarGroupLayout[];
    tooltipData: ChartDataPoint[];
    tooltipKeyToIndex: Record<string, number>;
    chartContentStyles: ReturnType<typeof parseStyles>['nodeStyles'];
    chartContainerStyles: ReturnType<typeof parseStyles>['parentNodeStyles'];
    type: ChartType | null;
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

/**
 * Parses the HTML tnode tree into chart config and makes it available to all chart sub-components.
 * Returns null when the chart data is invalid (no data points, or mixed cartesian/polar content).
 */
function VictoryChartProvider({tnode, children}: {tnode: TNode; children: React.ReactNode}) {
    const typefaces = useChartTypefaces();

    const processedResult = useMemo(() => {
        try {
            return processVictoryChartTree(tnode, typefaces.EXP_NEUE, null);
        } catch (error) {
            // Malformed chart HTML can make a parser throw. Fail closed (render nothing) instead of crashing the whole report.
            Log.warn('[VictoryChartProvider] Failed to process chart tree from malformed HTML', {error});
            return null;
        }
    }, [tnode, typefaces.EXP_NEUE]);

    const chartStyles = useMemo(() => parseStyles(tnode), [tnode]);

    const contextValue = useMemo((): VictoryChartContextValue | null => {
        if (!processedResult) {
            return null;
        }

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
        const type = resolveVictoryChartType(data);

        if (!type) {
            return null;
        }

        const {tooltipData, tooltipKeyToIndex} =
            barTooltipEntries.length > 0
                ? buildBarTooltipLookup(barTooltipEntries)
                : {
                      tooltipData: buildPieTooltipData(pieTooltipEntries),
                      tooltipKeyToIndex: {},
                  };

        return {
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
            chartContentStyles: chartStyles.nodeStyles,
            chartContainerStyles: chartStyles.parentNodeStyles,
            type,
        };
    }, [chartStyles, processedResult, tnode]);

    if (!contextValue) {
        return null;
    }

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
