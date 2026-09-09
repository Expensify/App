import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';

import type {DataModule} from '@shopify/react-native-skia';

import chartWebFont from './chartWebFont';

const EXPENSIFY_MONO_REGULAR = chartWebFont(require('@assets/fonts/web/ExpensifyMono-Regular.woff2') as string);
const EXPENSIFY_MONO_BOLD = chartWebFont(require('@assets/fonts/web/ExpensifyMono-Bold.woff2') as string);
const EXPENSIFY_MONO_ITALIC = chartWebFont(require('@assets/fonts/web/ExpensifyMono-Italic.woff2') as string);
const EXPENSIFY_MONO_BOLD_ITALIC = chartWebFont(require('@assets/fonts/web/ExpensifyMono-BoldItalic.woff2') as string);
const EXPENSIFY_NEUE_REGULAR = chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string);
const EXPENSIFY_NEUE_BOLD = chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string);
const EXPENSIFY_NEUE_ITALIC = chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Italic.woff2') as string);
const EXPENSIFY_NEUE_BOLD_ITALIC = chartWebFont(require('@assets/fonts/web/ExpensifyNeue-BoldItalic.woff2') as string);
const EXPENSIFY_NEW_KANSAS_MEDIUM = chartWebFont(require('@assets/fonts/web/ExpensifyNewKansas-Medium.woff2') as string);
const EXPENSIFY_NEW_KANSAS_MEDIUM_ITALIC = chartWebFont(require('@assets/fonts/web/ExpensifyNewKansas-MediumItalic.woff2') as string);
const CUSTOM_EMOJI_FONT = chartWebFont(require('@assets/fonts/web/CustomEmojiWebFont.ttf') as string);
const SANS_SYMBOLS_FONT = chartWebFont(require('@assets/fonts/NotoSans-Symbols.ttf') as string);
const SANS_SC_MONTHS_FONT = chartWebFont(require('@assets/fonts/NotoSansSC-Months.ttf') as string);

const CHART_SKIA_TYPEFACE_ASSETS: Record<ChartSkiaTypefaceKey, DataModule> = {
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
