import type {ParagraphWithWidth} from '@components/Charts/types';
import {buildChartParagraph, buildWrappedChartParagraph} from '@components/Charts/utils';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

/**
 * Builds and lays out Skia paragraphs for the given labels.
 * Returns an empty array until fontManager is available.
 *
 * When `maxLines` is set each label wraps at word breaks, centers its lines, and truncates anything
 * past `maxLines` with an ellipsis. Wrapped paragraphs report `width === layoutWidth` so the caller
 * can center them within the full column, rather than the measured longest-line width.
 */
function useChartParagraphs(
    labels: string[],
    fontManager: SkTypefaceFontProvider | null,
    fontSize: number,
    labelColor: string,
    layoutWidth: number,
    maxLines?: number,
): ParagraphWithWidth[] {
    if (!fontManager) {
        return [];
    }
    return labels.map((label): ParagraphWithWidth => {
        if (!label) {
            return {para: null, width: 0};
        }
        if (maxLines) {
            const para = buildWrappedChartParagraph(label, fontManager, fontSize, labelColor, maxLines);
            para.layout(layoutWidth);
            return {para, width: layoutWidth};
        }
        const para = buildChartParagraph(label, fontManager, fontSize, labelColor);
        para.layout(layoutWidth);
        return {para, width: para.getLongestLine()};
    });
}

export default useChartParagraphs;
