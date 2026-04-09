import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useMemo} from 'react';
import {ELLIPSIS, MIN_TRUNCATED_CHARS} from '@components/Charts/constants';
import type {ChartDataPoint} from '@components/Charts/types';
import {getFontLineMetrics, measureTextWidth} from '@components/Charts/utils';

/**
 * Computes all text measurements needed for label layout and domain padding.
 * Memoized on [data, fontMgr, fontSize] — re-runs only when data content or font changes,
 * not on layout geometry changes (scale, bounds, tick spacing) that happen during resize.
 */
function useChartLabelMeasurements(data: ChartDataPoint[], fontMgr: SkTypefaceFontProvider | null, fontSize: number) {
    return useMemo(() => {
        if (!fontMgr || data.length === 0) {
            return null;
        }

        const {ascent, descent} = getFontLineMetrics(fontMgr, fontSize);
        const lineHeight = Math.abs(ascent) + Math.abs(descent);
        const ellipsisWidth = measureTextWidth(ELLIPSIS, fontMgr, fontSize);
        const labelWidths = data.map((point) => measureTextWidth(point.label, fontMgr, fontSize));
        const maxLabelWidth = Math.max(...labelWidths);
        const firstLabelWidth = labelWidths.at(0) ?? 0;
        const lastLabelWidth = labelWidths.at(-1) ?? 0;

        const minTruncatedWidth = Math.max(
            ...data.map((point, index) => {
                if (point.label.length <= MIN_TRUNCATED_CHARS) {
                    return labelWidths.at(index) ?? 0;
                }
                return measureTextWidth(point.label.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontMgr, fontSize);
            }),
        );

        const firstLabel = data.at(0)?.label ?? '';
        const lastLabel = data.at(-1)?.label ?? '';
        const firstMinTrunc = firstLabel.length <= MIN_TRUNCATED_CHARS ? firstLabelWidth : measureTextWidth(firstLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontMgr, fontSize);
        const lastMinTrunc = lastLabel.length <= MIN_TRUNCATED_CHARS ? lastLabelWidth : measureTextWidth(lastLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontMgr, fontSize);

        return {lineHeight, ellipsisWidth, labelWidths, maxLabelWidth, firstLabelWidth, lastLabelWidth, minTruncatedWidth, firstMinTrunc, lastMinTrunc};
    }, [data, fontMgr, fontSize]);
}

export default useChartLabelMeasurements;
