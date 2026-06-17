import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {getYAxisLabelWidth} from '@components/Charts/utils';

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
    if (!fontMgr) {
        return 0;
    }

    return getYAxisLabelWidth(rawDataMax, rawDataMin, tickCount, formatValue, fontMgr, fontSize);
}

export default useYAxisLabelWidth;
