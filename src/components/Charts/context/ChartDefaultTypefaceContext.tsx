import type {SkTypeface} from '@shopify/react-native-skia';
import {createContext, useContext} from 'react';

type ChartDefaultTypeface = {
    regular: SkTypeface | null;
    bold: SkTypeface | null;
};

const ChartDefaultTypefaceContext = createContext<ChartDefaultTypeface | null>(null);

function useChartDefaultTypeface(): ChartDefaultTypeface {
    const typefaces = useContext(ChartDefaultTypefaceContext);
    if (!typefaces) {
        throw new Error('useChartDefaultTypeface must be used within ChartDefaultTypefaceProvider');
    }
    return typefaces;
}

export {ChartDefaultTypefaceContext, useChartDefaultTypeface};
export type {ChartDefaultTypeface};
