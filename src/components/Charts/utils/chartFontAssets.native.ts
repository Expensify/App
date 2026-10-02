import CUSTOM_EMOJI_FONT from '@assets/fonts/native/CustomEmojiNativeFont.ttf';
import EXPENSIFY_MONO_BOLD from '@assets/fonts/native/ExpensifyMono-Bold.otf';
import EXPENSIFY_MONO_BOLD_ITALIC from '@assets/fonts/native/ExpensifyMono-BoldItalic.otf';
import EXPENSIFY_MONO_ITALIC from '@assets/fonts/native/ExpensifyMono-Italic.otf';
import EXPENSIFY_MONO_REGULAR from '@assets/fonts/native/ExpensifyMono-Regular.otf';
import EXPENSIFY_NEUE_BOLD from '@assets/fonts/native/ExpensifyNeue-Bold.otf';
import EXPENSIFY_NEUE_BOLD_ITALIC from '@assets/fonts/native/ExpensifyNeue-BoldItalic.otf';
import EXPENSIFY_NEUE_ITALIC from '@assets/fonts/native/ExpensifyNeue-Italic.otf';
import EXPENSIFY_NEUE_REGULAR from '@assets/fonts/native/ExpensifyNeue-Regular.otf';
import EXPENSIFY_NEW_KANSAS_MEDIUM from '@assets/fonts/native/ExpensifyNewKansas-Medium.otf';
import EXPENSIFY_NEW_KANSAS_MEDIUM_ITALIC from '@assets/fonts/native/ExpensifyNewKansas-MediumItalic.otf';
import SANS_SYMBOLS_FONT from '@assets/fonts/NotoSans-Symbols.ttf';
import SANS_SC_MONTHS_FONT from '@assets/fonts/NotoSansSC-Months.ttf';

import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';

const CHART_SKIA_TYPEFACE_ASSETS: Record<ChartSkiaTypefaceKey, number | string> = {
    MONOSPACE: EXPENSIFY_MONO_REGULAR,
    MONOSPACE_BOLD: EXPENSIFY_MONO_BOLD,
    MONOSPACE_ITALIC: EXPENSIFY_MONO_ITALIC,
    MONOSPACE_BOLD_ITALIC: EXPENSIFY_MONO_BOLD_ITALIC,
    EXP_NEUE: EXPENSIFY_NEUE_REGULAR,
    EXP_NEUE_BOLD: EXPENSIFY_NEUE_BOLD,
    EXP_NEUE_ITALIC: EXPENSIFY_NEUE_ITALIC,
    EXP_NEUE_BOLD_ITALIC: EXPENSIFY_NEUE_BOLD_ITALIC,
    EXP_NEW_KANSAS_MEDIUM: EXPENSIFY_NEW_KANSAS_MEDIUM,
    EXP_NEW_KANSAS_MEDIUM_ITALIC: EXPENSIFY_NEW_KANSAS_MEDIUM_ITALIC,
    CUSTOM_EMOJI_FONT,
};

const CHART_FONT_MGR_SUPPLEMENTAL_ASSETS = {
    NotoSansSymbols: SANS_SYMBOLS_FONT,
    NotoSansSCMonths: SANS_SC_MONTHS_FONT,
} as const;

export {CHART_FONT_MGR_SUPPLEMENTAL_ASSETS, CHART_SKIA_TYPEFACE_ASSETS};
