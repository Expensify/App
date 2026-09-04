import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import getVictoryChartTreeTypeface from '@components/Charts/utils/getVictoryChartTreeTypeface';
import type {ChartType, LabelItem, LegendItem, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computeAdjustedOverlayY from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeAdjustedOverlayY';
import computeDynamicChartHeight from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeDynamicChartHeight';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';
import scaleVictoryChartContextValue from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/scaleVictoryChartContextValue';

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
    pointMetadata: ProcessNodeResult['pointMetadata'];
    chartContentStyles: ReturnType<typeof parseStyles>['nodeStyles'];
    chartContainerStyles: ReturnType<typeof parseStyles>['parentNodeStyles'];
    type: ChartType;

    /**
     * Uniform factor already applied to the pixel-space values in this context (1 for inline charts).
     * Series components that parse raw pixel attributes from the tnode (bar width, corner radius,
     * stroke width) must multiply them by this factor so they scale with the rest of the chart.
     */
    pixelScale: number;
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
    const {data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, isHorizontal, categories, labelItems, legendItems, pointMetadata} = processedResult;
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
        pointMetadata,
        labelItems: effectiveLabelItems,
        legendItems: effectiveLegendItems,
        chartContentStyles: effectiveChartContentStyles,
        chartContainerStyles,
        type,
        pixelScale: 1,
    };

    return <VictoryChartContext.Provider value={contextValue}>{children}</VictoryChartContext.Provider>;
}

type VictoryChartScaledProviderProps = {
    /** Uniform factor to scale all pixel-space chart config by (may be > 1) */
    scale: number;

    /** Chart sub-tree to re-provide the scaled context to */
    children: React.ReactNode;
};

/**
 * Re-provides the current chart context with every pixel-space value scaled by a uniform factor.
 * Used by the expand modal to re-render the chart natively at a larger size (sharp Skia output)
 * while keeping labels, legends, axes, and paddings proportionally identical to the inline chart.
 */
function VictoryChartScaledProvider({scale, children}: VictoryChartScaledProviderProps) {
    const value = useVictoryChartContext();
    const typefaces = useChartTypefaces();
    const typeface = getVictoryChartTreeTypeface(typefaces);
    // No manual memoization — React Compiler memoizes this call automatically.
    const scaledValue = scaleVictoryChartContextValue(value, scale, typeface);
    return <VictoryChartContext.Provider value={scaledValue}>{children}</VictoryChartContext.Provider>;
}

function useVictoryChartContext(): VictoryChartContextValue {
    const context = useContext(VictoryChartContext);
    if (!context) {
        throw new Error('useVictoryChartContext must be used within VictoryChartProvider');
    }
    return context;
}

export {VictoryChartProvider, VictoryChartScaledProvider, useVictoryChartContext};
export type {VictoryChartContextValue};
