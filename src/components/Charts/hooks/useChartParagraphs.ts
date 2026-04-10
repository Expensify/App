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
    }, [labels, fontMgr, fontSize, labelColor, layoutWidth]);
}

export default useChartParagraphs;
