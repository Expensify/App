import React, {createContext, useContext} from 'react';
import type {TNode} from 'react-native-render-html';
import type {CartesianChartRenderArg} from 'victory-native';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import type {CartesianChartData, ChartType, ProcessNodeResult, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';
import {CHART_TYPE} from '../constants';

type VictoryChartContextValue = {
    tnode: TNode;
    data: ProcessNodeResult['data'];
    xKey: ProcessNodeResult['xKey'];
    yKeys: ProcessNodeResult['yKeys'];
    xAxis: ProcessNodeResult['xAxis'];
    yAxis: ProcessNodeResult['yAxis'];
    labelItems: ProcessNodeResult['labelItems'];
    legendItems: ProcessNodeResult['legendItems'];
    chartContentStyles: ReturnType<typeof parseStyles>['nodeStyles'];
    chartContainerStyles: ReturnType<typeof parseStyles>['parentNodeStyles'];
    type: ChartType;
};

const VictoryChartContext = createContext<VictoryChartContextValue | null>(null);
const VictoryChartRenderArgsContext = createContext<CartesianChartRenderArg<CartesianChartData, YKey> | null>(null);

/**
 * Parses the HTML tnode tree into chart config and makes it available to all chart sub-components.
 * Returns null when the chart data is invalid (no data points, or mixed cartesian/polar content).
 */
function VictoryChartProvider({tnode, children}: {tnode: TNode; children: React.ReactNode}) {
    const {regular: regularTypeface} = useChartDefaultTypeface();
    const {data, xKey, yKeys, xAxis, yAxis, labelItems, legendItems} = processVictoryChartTree(tnode, regularTypeface);
    const {nodeStyles: chartContentStyles, parentNodeStyles: chartContainerStyles} = parseStyles(tnode);

    const hasCartesianData = Object.keys(data).length > 0;
    const hasPolarData = false;
    let type: ChartType = null;

    // XNOR Check. There must one and only one valid chart
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
        labelItems,
        legendItems,
        chartContentStyles,
        chartContainerStyles,
        type,
    };

    return <VictoryChartContext.Provider value={contextValue}>{children}</VictoryChartContext.Provider>;
}

VictoryChartProvider.displayName = 'VictoryChartProvider';

/**
 * Makes the CartesianChart render-prop arguments available to series sub-components
 * (VictoryChartBar, VictoryChartLine) rendered inside the chart's children callback.
 */
function VictoryChartRenderArgsProvider({value, children}: {value: CartesianChartRenderArg<CartesianChartData, YKey>; children: React.ReactNode}) {
    return <VictoryChartRenderArgsContext.Provider value={value}>{children}</VictoryChartRenderArgsContext.Provider>;
}

VictoryChartRenderArgsProvider.displayName = 'VictoryChartRenderArgsProvider';

function useVictoryChartContext(): VictoryChartContextValue {
    const context = useContext(VictoryChartContext);
    if (!context) {
        throw new Error('useVictoryChartContext must be used within VictoryChartProvider');
    }
    return context;
}

function useVictoryChartRenderArgs(): CartesianChartRenderArg<CartesianChartData, YKey> {
    const context = useContext(VictoryChartRenderArgsContext);
    if (!context) {
        throw new Error('useVictoryChartRenderArgs must be used within VictoryChartRenderArgsProvider');
    }
    return context;
}

export {VictoryChartProvider, VictoryChartRenderArgsProvider, useVictoryChartContext, useVictoryChartRenderArgs};
export type {VictoryChartContextValue};
