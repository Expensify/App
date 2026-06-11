import React from 'react';
import useChartFonts from '@components/Charts/hooks/useChartFonts';
import {ChartFontsContext} from './ChartFontsContext';

function ChartFontsLoaderProvider({children}: {children: React.ReactNode}) {
    const fonts = useChartFonts();
    return <ChartFontsContext.Provider value={fonts}>{children}</ChartFontsContext.Provider>;
}

export default ChartFontsLoaderProvider;
