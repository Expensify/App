import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useMemo} from 'react';
import type {ParagraphWithWidth} from '@components/Charts/types';
import {buildChartParagraph} from '@components/Charts/utils';

/**
 * Builds and lays out Skia paragraphs for the given labels.
 * Memoized via useMemo — re-runs when the labels array reference, font, color, or layout width change.
 * Returns an empty array until fontMgr is available.
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
