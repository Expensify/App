import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {ParagraphWithWidth} from '@components/Charts/types';
import {buildChartParagraph} from '@components/Charts/utils';

/**
 * Builds and lays out Skia paragraphs for the given labels.
 * Returns an empty array until fontManager is available.
 */
function useChartParagraphs(labels: string[], fontManager: SkTypefaceFontProvider | null, fontSize: number, labelColor: string, layoutWidth: number): ParagraphWithWidth[] {
    if (!fontManager) {
        return [];
    }
    return labels.map((label): ParagraphWithWidth => {
        if (!label) {
            return {para: null, width: 0};
        }
        const para = buildChartParagraph(label, fontManager, fontSize, labelColor);
        para.layout(layoutWidth);
        return {para, width: para.getLongestLine()};
    });
}

export default useChartParagraphs;
