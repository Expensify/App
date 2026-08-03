import React, {createContext, useContext} from 'react';

const VictoryChartLayoutScaleContext = createContext(1);

function VictoryChartLayoutScaleProvider({scale, children}: {scale: number; children: React.ReactNode}) {
    return <VictoryChartLayoutScaleContext.Provider value={scale}>{children}</VictoryChartLayoutScaleContext.Provider>;
}

VictoryChartLayoutScaleProvider.displayName = 'VictoryChartLayoutScaleProvider';

function useVictoryChartLayoutScale(): number {
    return useContext(VictoryChartLayoutScaleContext);
}

export {VictoryChartLayoutScaleProvider, useVictoryChartLayoutScale};
