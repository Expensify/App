import useChartFonts from '@components/Charts/hooks/useChartFonts';

import React from 'react';

import {ChartFontsContext} from './ChartFontsContext';

function ChartFontsLoaderProvider({children}: {children: React.ReactNode}) {
    const fonts = useChartFonts();
    return <ChartFontsContext.Provider value={fonts}>{children}</ChartFontsContext.Provider>;
}

export default ChartFontsLoaderProvider;
