import type {CartesianChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import type {CartesianChartRenderArg} from 'victory-native';

import React, {createContext, useContext} from 'react';

type VictoryChartRenderArgs = CartesianChartRenderArg<CartesianChartData, YKey> & {
    /**
     * Uniform factor applied to the chart's pixel-space config (1 for inline charts). It travels
     * through this context because series components render inside the chart's canvas, where the
     * outer VictoryChartContext does not propagate.
     */
    pixelScale: number;
};

const VictoryChartRenderArgsContext = createContext<VictoryChartRenderArgs | null>(null);

/**
 * Makes the CartesianChart render-prop arguments available to series sub-components
 * (VictoryChartBar, VictoryChartLine) rendered inside the chart's children callback.
 */
function VictoryChartRenderArgsProvider({value, children}: {value: VictoryChartRenderArgs; children: React.ReactNode}) {
    return <VictoryChartRenderArgsContext.Provider value={value}>{children}</VictoryChartRenderArgsContext.Provider>;
}

VictoryChartRenderArgsProvider.displayName = 'VictoryChartRenderArgsProvider';

function useVictoryChartRenderArgs(): VictoryChartRenderArgs {
    const context = useContext(VictoryChartRenderArgsContext);
    if (!context) {
        throw new Error('useVictoryChartRenderArgs must be used within VictoryChartRenderArgsProvider');
    }
    return context;
}

export {VictoryChartRenderArgsProvider, useVictoryChartRenderArgs};
