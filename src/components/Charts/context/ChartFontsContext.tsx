import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

import {createContext, useContext} from 'react';

const ChartFontsContext = createContext<ChartFontsValue | null>(null);

function useChartFontsContext(): ChartFontsValue {
    const context = useContext(ChartFontsContext);

    if (!context) {
        throw new Error('Chart fonts hooks must be used within ChartFontsProvider');
    }

    return context;
}

function useChartTypefaces(): ChartDefaultTypeface {
    return useChartFontsContext().typefaces;
}

function useChartFontManager(): SkTypefaceFontProvider | null {
    return useChartFontsContext().fontManager;
}

export {ChartFontsContext, useChartFontManager, useChartTypefaces};
