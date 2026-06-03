import {createContext, useContext} from 'react';
import type {ChartDefaultTypeface} from './chartSkiaTypefaceTypes';

const ChartDefaultTypefaceContext = createContext<ChartDefaultTypeface | null>(null);

function useChartDefaultTypeface(): ChartDefaultTypeface {
    const context = useContext(ChartDefaultTypefaceContext);
    if (!context) {
        throw new Error('useChartDefaultTypeface must be used within ChartDefaultTypefaceProvider');
    }
    return context;
}

export {ChartDefaultTypefaceContext, useChartDefaultTypeface};
