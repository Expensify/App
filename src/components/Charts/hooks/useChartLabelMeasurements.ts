import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {ELLIPSIS, MIN_TRUNCATED_CHARS} from '@components/Charts/constants';
import type {ChartDataPoint} from '@components/Charts/types';
import {getFontLineMetrics, measureTextWidth} from '@components/Charts/utils';

/**
 * Computes all text measurements needed for label layout and domain padding.
 */
function useChartLabelMeasurements(data: ChartDataPoint[], fontMgr: SkTypefaceFontProvider | null, fontSize: number) {
    if (!fontMgr || data.length === 0) {
        return {lineHeight: 0, ellipsisWidth: 0, labelWidths: [], maxLabelWidth: 0, firstLabelWidth: 0, lastLabelWidth: 0, minTruncatedWidth: 0, firstMinTrunc: 0, lastMinTrunc: 0};
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
}

export default useChartLabelMeasurements;
