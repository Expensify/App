import React from 'react';
import useChartSkiaTypefaces from '../hooks/useChartSkiaTypefaces';
import {ChartDefaultTypefaceContext} from './ChartDefaultTypefaceContext';

function ChartDefaultTypefaceProvider({children}: {children: React.ReactNode}) {
    const typefaces = useChartSkiaTypefaces();

    return <ChartDefaultTypefaceContext.Provider value={typefaces}>{children}</ChartDefaultTypefaceContext.Provider>;
}

ChartDefaultTypefaceProvider.displayName = 'ChartDefaultTypefaceProvider';

export default ChartDefaultTypefaceProvider;
