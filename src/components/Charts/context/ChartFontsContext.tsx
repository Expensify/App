import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {createContext, useContext} from 'react';
import type {ChartFontsContextValue} from '@components/Charts/types/chartFontsTypes';
import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';

const ChartFontsContext = createContext<ChartFontsContextValue | null>(null);

function useChartFontsContext(): ChartFontsContextValue {
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
    return useChartFontsContext().fontMgr;
}

export {ChartFontsContext, useChartFontManager, useChartTypefaces};
