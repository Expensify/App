import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';

import type {TupleToUnion} from 'type-fest';

/** Font families registered on Skia fontManager and used by Paragraph API multi-font fallback. */
const CHART_FONT_FAMILY_NAMES = ['ExpensifyNeue', 'NotoSansSymbols', 'NotoSansSCMonths', 'ExpensifyNewKansas', 'ExpensifyMono'] as const;

type ChartFontFamilyName = TupleToUnion<typeof CHART_FONT_FAMILY_NAMES>;

/** Maps fontManager family names to already-loaded chart typefaces (Noto families load separately). */
const CHART_FONT_MGR_FROM_TYPEFACES: Record<Exclude<ChartFontFamilyName, 'NotoSansSymbols' | 'NotoSansSCMonths'>, ChartSkiaTypefaceKey[]> = {
    ExpensifyNeue: ['EXP_NEUE', 'EXP_NEUE_BOLD', 'EXP_NEUE_ITALIC', 'EXP_NEUE_BOLD_ITALIC'],
    ExpensifyMono: ['MONOSPACE', 'MONOSPACE_BOLD', 'MONOSPACE_ITALIC', 'MONOSPACE_BOLD_ITALIC'],
    ExpensifyNewKansas: ['EXP_NEW_KANSAS_MEDIUM', 'EXP_NEW_KANSAS_MEDIUM_ITALIC'],
};

export {CHART_FONT_FAMILY_NAMES, CHART_FONT_MGR_FROM_TYPEFACES};
