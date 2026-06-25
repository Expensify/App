import React, {createContext, useContext} from 'react';
import type {CartesianChartRenderArg} from 'victory-native';
import type {CartesianChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

const VictoryChartRenderArgsContext = createContext<CartesianChartRenderArg<CartesianChartData, YKey> | null>(null);

/**
 * Makes the CartesianChart render-prop arguments available to series sub-components
 * (VictoryChartBar, VictoryChartLine) rendered inside the chart's children callback.
 */
function VictoryChartRenderArgsProvider({value, children}: {value: CartesianChartRenderArg<CartesianChartData, YKey>; children: React.ReactNode}) {
    return <VictoryChartRenderArgsContext.Provider value={value}>{children}</VictoryChartRenderArgsContext.Provider>;
}

VictoryChartRenderArgsProvider.displayName = 'VictoryChartRenderArgsProvider';

function useVictoryChartRenderArgs(): CartesianChartRenderArg<CartesianChartData, YKey> {
    const context = useContext(VictoryChartRenderArgsContext);
    if (!context) {
        throw new Error('useVictoryChartRenderArgs must be used within VictoryChartRenderArgsProvider');
    }
    return context;
}

export {VictoryChartRenderArgsProvider, useVictoryChartRenderArgs};
