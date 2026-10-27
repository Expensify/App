import {useReportChartLoading} from '@components/Charts/components/ChartReveal';
import {useChartFontManager} from '@components/Charts/context/ChartFontsContext';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

type CartesianCanvasInputs = {
    chartWidth: number;
    fontManager: SkTypefaceFontProvider;
};

function useReadyCartesianCanvas(isLoading: boolean, chartWidth: number | null): CartesianCanvasInputs | null {
    const fontManager = useChartFontManager();

    const isChartLoading = isLoading || !fontManager;
    useReportChartLoading(isChartLoading);

    if (isChartLoading || chartWidth === null) {
        return null;
    }

    return {chartWidth, fontManager};
}

export default useReadyCartesianCanvas;
export type {CartesianCanvasInputs};
