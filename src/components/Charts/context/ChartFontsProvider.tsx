import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';

import React from 'react';

import {ChartFontsContext} from './ChartFontsContext';
import ChartFontsLoaderProvider from './ChartFontsLoaderProvider';

type ChartFontsProviderProps = {
    children: React.ReactNode;
    value?: ChartFontsValue;
};

function ChartFontsProvider({children, value}: ChartFontsProviderProps) {
    if (value) {
        return <ChartFontsContext.Provider value={value}>{children}</ChartFontsContext.Provider>;
    }

    return <ChartFontsLoaderProvider>{children}</ChartFontsLoaderProvider>;
}

export default ChartFontsProvider;
