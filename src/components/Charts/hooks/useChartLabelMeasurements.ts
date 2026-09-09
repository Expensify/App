import type {ChartDataPoint} from '@components/Charts/types';
import {getFontLineMetrics, getXAxisLabel, measureTextWidth} from '@components/Charts/utils';
import {ELLIPSIS, MIN_TRUNCATED_CHARS} from '@components/Charts/VictoryTheme';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

/**
 * Computes all text measurements needed for label layout and domain padding.
 */
function useChartLabelMeasurements(data: ChartDataPoint[], fontManager: SkTypefaceFontProvider | null, fontSize: number) {
    if (!fontManager || data.length === 0) {
        return {lineHeight: 0, ellipsisWidth: 0, labelWidths: [], maxLabelWidth: 0, firstLabelWidth: 0, lastLabelWidth: 0, minTruncatedWidth: 0, firstMinTrunc: 0, lastMinTrunc: 0};
    }

    const {ascent, descent} = getFontLineMetrics(fontManager, fontSize);
    const lineHeight = Math.abs(ascent) + Math.abs(descent);
    const ellipsisWidth = measureTextWidth(ELLIPSIS, fontManager, fontSize);
    const labels = data.map(getXAxisLabel);
    const labelWidths = labels.map((label) => measureTextWidth(label, fontManager, fontSize));
    const maxLabelWidth = Math.max(...labelWidths);
    const firstLabelWidth = labelWidths.at(0) ?? 0;
    const lastLabelWidth = labelWidths.at(-1) ?? 0;

    const minTruncatedWidth = Math.max(
        ...labels.map((label, index) => {
            if (label.length <= MIN_TRUNCATED_CHARS) {
                return labelWidths.at(index) ?? 0;
            }
            return measureTextWidth(label.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontManager, fontSize);
        }),
    );

    const firstLabel = labels.at(0) ?? '';
    const lastLabel = labels.at(-1) ?? '';
    const firstMinTrunc = firstLabel.length <= MIN_TRUNCATED_CHARS ? firstLabelWidth : measureTextWidth(firstLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontManager, fontSize);
    const lastMinTrunc = lastLabel.length <= MIN_TRUNCATED_CHARS ? lastLabelWidth : measureTextWidth(lastLabel.slice(0, MIN_TRUNCATED_CHARS) + ELLIPSIS, fontManager, fontSize);

    return {lineHeight, ellipsisWidth, labelWidths, maxLabelWidth, firstLabelWidth, lastLabelWidth, minTruncatedWidth, firstMinTrunc, lastMinTrunc};
}

export default useChartLabelMeasurements;
