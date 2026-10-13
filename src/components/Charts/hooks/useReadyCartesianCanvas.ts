import {useReportChartLoading} from '@components/Charts/components/ChartReveal';
import {useChartFontManager} from '@components/Charts/context/ChartFontsContext';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

type CartesianCanvasInputs = {
    chartWidth: number;
    fontManager: SkTypefaceFontProvider;
};

function useReadyCartesianCanvas(isLoading: boolean, chartWidth: number | null): CartesianCanvasInputs | null {
    const fontManager = useChartFontManager();

    // Until the width is measured there is no canvas for Skia to draw, so the reveal must not start counting frames yet
    const isChartLoading = isLoading || !fontManager || chartWidth === null;
    useReportChartLoading(isChartLoading);

    if (isChartLoading) {
        return null;
    }

    return {chartWidth, fontManager};
}

export default useReadyCartesianCanvas;
export type {CartesianCanvasInputs};
