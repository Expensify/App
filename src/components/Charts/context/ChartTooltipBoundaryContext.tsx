import type {MeasureInWindowOnSuccessCallback} from 'react-native';

import {createContext, useContext} from 'react';

/** Measures the view whose top edge clips chart tooltips (e.g. a ScrollView) in window coordinates */
type MeasureChartTooltipBoundary = (callback: MeasureInWindowOnSuccessCallback) => void;

/** Without a provider, tooltips are kept below the top of the window */
const ChartTooltipBoundaryContext = createContext<MeasureChartTooltipBoundary | null>(null);

function useMeasureChartTooltipBoundary(): MeasureChartTooltipBoundary | null {
    return useContext(ChartTooltipBoundaryContext);
}

export {ChartTooltipBoundaryContext, useMeasureChartTooltipBoundary};
export type {MeasureChartTooltipBoundary};
