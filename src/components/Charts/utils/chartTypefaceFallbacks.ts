import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';

/** Same-family degradations tried before EXP_NEUE and the first available typeface. */
const CHART_TYPEFACE_SAME_FAMILY_FALLBACKS: Partial<Record<ChartSkiaTypefaceKey, ChartSkiaTypefaceKey[]>> = {
    EXP_NEUE_BOLD: ['EXP_NEUE'],
    EXP_NEUE_ITALIC: ['EXP_NEUE'],
    EXP_NEUE_BOLD_ITALIC: ['EXP_NEUE_BOLD', 'EXP_NEUE_ITALIC', 'EXP_NEUE'],
    MONOSPACE_BOLD: ['MONOSPACE'],
    MONOSPACE_ITALIC: ['MONOSPACE'],
    MONOSPACE_BOLD_ITALIC: ['MONOSPACE_BOLD', 'MONOSPACE_ITALIC', 'MONOSPACE'],
    EXP_NEW_KANSAS_MEDIUM_ITALIC: ['EXP_NEW_KANSAS_MEDIUM'],
};

/** List of fallback fonts for symbols not included in Expensify New Kansas  */
const CHART_TYPEFACE_GLYPH_FALLBACKS: Partial<Record<ChartSkiaTypefaceKey, ChartSkiaTypefaceKey>> = {
    EXP_NEW_KANSAS_MEDIUM: 'EXP_NEUE_BOLD',
    EXP_NEW_KANSAS_MEDIUM_ITALIC: 'EXP_NEUE_BOLD_ITALIC',
};

export default CHART_TYPEFACE_SAME_FAMILY_FALLBACKS;
export {CHART_TYPEFACE_GLYPH_FALLBACKS};
