import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useMemo} from 'react';
import type {ParagraphWithWidth} from '@components/Charts/types';
import {buildChartParagraph} from '@components/Charts/utils';

/**
 * Builds Skia paragraphs for the given labels, memoized by the string *values* of the labels
 * (not their array reference). Re-runs only when the label content, font, color, or layout
 * width actually changes — not when the parent passes a new array reference with the same strings.
 */
function useChartParagraphs(labels: string[], fontMgr: SkTypefaceFontProvider | null, fontSize: number, labelColor: string, layoutWidth: number): ParagraphWithWidth[] {
    // Join into a single string so useMemo compares label content, not the array reference.
    const labelsKey = labels.join('\0');

    return useMemo((): ParagraphWithWidth[] => {
        if (!fontMgr) {
            return [];
        }
        return labels.map((label): ParagraphWithWidth => {
            if (!label) {
                return {para: null, width: 0};
            }
            const para = buildChartParagraph(label, fontMgr, fontSize, labelColor);
            para.layout(layoutWidth);
            return {para, width: para.getLongestLine()};
        });
        // labelsKey is a serialized form of labels — intentionally used instead of the array
        // reference so the memo re-runs only when label strings change, not on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [labelsKey, fontMgr, fontSize, labelColor, layoutWidth]);
}

export default useChartParagraphs;
