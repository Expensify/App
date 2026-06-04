import type {DataModule} from '@shopify/react-native-skia';
import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';

const EXPENSIFY_MONO_REGULAR = require('@assets/fonts/native/ExpensifyMono-Regular.otf') as DataModule;
const EXPENSIFY_MONO_BOLD = require('@assets/fonts/native/ExpensifyMono-Bold.otf') as DataModule;
const EXPENSIFY_MONO_ITALIC = require('@assets/fonts/native/ExpensifyMono-Italic.otf') as DataModule;
const EXPENSIFY_MONO_BOLD_ITALIC = require('@assets/fonts/native/ExpensifyMono-BoldItalic.otf') as DataModule;
const EXPENSIFY_NEUE_REGULAR = require('@assets/fonts/native/ExpensifyNeue-Regular.otf') as DataModule;
const EXPENSIFY_NEUE_BOLD = require('@assets/fonts/native/ExpensifyNeue-Bold.otf') as DataModule;
const EXPENSIFY_NEUE_ITALIC = require('@assets/fonts/native/ExpensifyNeue-Italic.otf') as DataModule;
const EXPENSIFY_NEUE_BOLD_ITALIC = require('@assets/fonts/native/ExpensifyNeue-BoldItalic.otf') as DataModule;
const EXPENSIFY_NEW_KANSAS_MEDIUM = require('@assets/fonts/native/ExpensifyNewKansas-Medium.otf') as DataModule;
const EXPENSIFY_NEW_KANSAS_MEDIUM_ITALIC = require('@assets/fonts/native/ExpensifyNewKansas-MediumItalic.otf') as DataModule;
const CUSTOM_EMOJI_FONT = require('@assets/fonts/native/CustomEmojiNativeFont.ttf') as DataModule;
const SANS_SYMBOLS_FONT = require('@assets/fonts/NotoSans-Symbols.ttf') as DataModule;
const SANS_SC_MONTHS_FONT = require('@assets/fonts/NotoSansSC-Months.ttf') as DataModule;

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
