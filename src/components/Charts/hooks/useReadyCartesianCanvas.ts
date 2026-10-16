import {useChartFontManager} from '@components/Charts/context/ChartFontsContext';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

type CartesianCanvasInputs = {
    chartWidth: number;
    fontManager: SkTypefaceFontProvider;
};

function useReadyCartesianCanvas(isLoading: boolean, chartWidth: number | null): CartesianCanvasInputs | null {
    const fontManager = useChartFontManager();

    if (isLoading || !fontManager || chartWidth === null) {
        return null;
    }

    return {chartWidth, fontManager};
}

export default useReadyCartesianCanvas;
export type {CartesianCanvasInputs};
