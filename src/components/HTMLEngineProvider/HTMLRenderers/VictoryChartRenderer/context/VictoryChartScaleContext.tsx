import {createContext, useContext} from 'react';

type VictoryChartScaleValue = {
    x: number;
    y: number;
};

const DEFAULT_SCALE: VictoryChartScaleValue = {x: 1, y: 1};

const VictoryChartScaleContext = createContext<VictoryChartScaleValue>(DEFAULT_SCALE);

function useVictoryChartScale(): VictoryChartScaleValue {
    return useContext(VictoryChartScaleContext);
}

export type {VictoryChartScaleValue};
export {DEFAULT_SCALE, VictoryChartScaleContext, useVictoryChartScale};
