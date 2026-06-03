import React from 'react';
import useChartFonts from '@components/Charts/hooks/useChartFonts';
import type {ChartFontsValue} from '@components/Charts/types/chartFontsTypes';
import {ChartFontsContext} from './ChartFontsContext';

type ChartFontsProviderProps = {
    children: React.ReactNode;
    value?: ChartFontsValue;
};

function ChartFontsLoaderProvider({children}: {children: React.ReactNode}) {
    const fonts = useChartFonts();

    return <ChartFontsContext.Provider value={fonts}>{children}</ChartFontsContext.Provider>;
}

ChartFontsLoaderProvider.displayName = 'ChartFontsLoaderProvider';

function ChartFontsProvider({children, value}: ChartFontsProviderProps) {
    if (value) {
        return <ChartFontsContext.Provider value={value}>{children}</ChartFontsContext.Provider>;
    }

    return <ChartFontsLoaderProvider>{children}</ChartFontsLoaderProvider>;
}

ChartFontsProvider.displayName = 'ChartFontsProvider';

export default ChartFontsProvider;
