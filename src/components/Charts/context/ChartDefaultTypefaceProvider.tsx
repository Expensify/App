import React from 'react';
import {ChartDefaultTypefaceContext} from './ChartDefaultTypefaceContext';
import useChartSkiaTypefaces from './useChartSkiaTypefaces';

function ChartDefaultTypefaceProvider({children}: {children: React.ReactNode}) {
    const typefaces = useChartSkiaTypefaces();

    return <ChartDefaultTypefaceContext.Provider value={typefaces}>{children}</ChartDefaultTypefaceContext.Provider>;
}

ChartDefaultTypefaceProvider.displayName = 'ChartDefaultTypefaceProvider';

export default ChartDefaultTypefaceProvider;
