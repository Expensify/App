import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {getNiceLowerBound, getNiceUpperBound, measureTextWidth} from '@components/Charts/utils';

/**
 * Returns the pixel width of the widest y-axis label for the nice tick range.
 */
function useYAxisLabelWidth(
    rawDataMax: number,
    rawDataMin: number,
    tickCount: number,
    formatValue: (value: number) => string,
    fontMgr: SkTypefaceFontProvider | null,
    fontSize: number,
): number {
    const niceMax = getNiceUpperBound(rawDataMax, tickCount, rawDataMin);
    const niceMin = getNiceLowerBound(rawDataMin, tickCount, rawDataMax);
    const formattedMax = formatValue(niceMax);
    const formattedMin = formatValue(niceMin);

    if (!fontMgr) {
        return 0;
    }
    return Math.max(measureTextWidth(formattedMax, fontMgr, fontSize), measureTextWidth(formattedMin, fontMgr, fontSize));
}

export default useYAxisLabelWidth;
