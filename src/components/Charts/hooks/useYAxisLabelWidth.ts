import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useMemo} from 'react';
import {getNiceLowerBound, getNiceUpperBound, measureTextWidth} from '@components/Charts/utils';

/**
 * Returns the pixel width of the widest y-axis label, memoized on the formatted string values
 * and font. Re-runs only when the data range, format, or font actually changes — not on every
 * re-render caused by Victory passing new object references.
 */
function useYAxisLabelWidth(
    rawDataMax: number,
    rawDataMin: number,
    tickCount: number,
    formatValue: (value: number) => string,
    fontMgr: SkTypefaceFontProvider | null,
    fontSize: number,
): number {
    // Compute the formatted strings outside useMemo so the memo depends on their values,
    // not on the (potentially unstable) formatValue function reference.
    const niceMax = getNiceUpperBound(rawDataMax, tickCount, rawDataMin);
    const niceMin = getNiceLowerBound(rawDataMin, tickCount, rawDataMax);
    const formattedMax = formatValue(niceMax);
    const formattedMin = formatValue(niceMin);

    return useMemo(() => {
        if (!fontMgr) {
            return 0;
        }
        return Math.max(measureTextWidth(formattedMax, fontMgr, fontSize), measureTextWidth(formattedMin, fontMgr, fontSize));
    }, [formattedMax, formattedMin, fontMgr, fontSize]);
}

export default useYAxisLabelWidth;
