import sansSymbolsFontAsset from '@assets/fonts/NotoSans-Symbols.ttf';
import sansScMonthsFontAsset from '@assets/fonts/NotoSansSC-Months.ttf';
import customEmojiFontAsset from '@assets/fonts/web/CustomEmojiWebFont.ttf';
import expensifyMonoBoldAsset from '@assets/fonts/web/ExpensifyMono-Bold.woff2';
import expensifyMonoBoldItalicAsset from '@assets/fonts/web/ExpensifyMono-BoldItalic.woff2';
import expensifyMonoItalicAsset from '@assets/fonts/web/ExpensifyMono-Italic.woff2';
import expensifyMonoRegularAsset from '@assets/fonts/web/ExpensifyMono-Regular.woff2';
import expensifyNeueBoldAsset from '@assets/fonts/web/ExpensifyNeue-Bold.woff2';
import expensifyNeueBoldItalicAsset from '@assets/fonts/web/ExpensifyNeue-BoldItalic.woff2';
import expensifyNeueItalicAsset from '@assets/fonts/web/ExpensifyNeue-Italic.woff2';
import expensifyNeueRegularAsset from '@assets/fonts/web/ExpensifyNeue-Regular.woff2';
import expensifyNewKansasMediumAsset from '@assets/fonts/web/ExpensifyNewKansas-Medium.woff2';
import expensifyNewKansasMediumItalicAsset from '@assets/fonts/web/ExpensifyNewKansas-MediumItalic.woff2';

import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';

import type {DataModule} from '@shopify/react-native-skia';

import chartWebFont from './chartWebFont';

const EXPENSIFY_MONO_REGULAR = chartWebFont(expensifyMonoRegularAsset);
const EXPENSIFY_MONO_BOLD = chartWebFont(expensifyMonoBoldAsset);
const EXPENSIFY_MONO_ITALIC = chartWebFont(expensifyMonoItalicAsset);
const EXPENSIFY_MONO_BOLD_ITALIC = chartWebFont(expensifyMonoBoldItalicAsset);
const EXPENSIFY_NEUE_REGULAR = chartWebFont(expensifyNeueRegularAsset);
const EXPENSIFY_NEUE_BOLD = chartWebFont(expensifyNeueBoldAsset);
const EXPENSIFY_NEUE_ITALIC = chartWebFont(expensifyNeueItalicAsset);
const EXPENSIFY_NEUE_BOLD_ITALIC = chartWebFont(expensifyNeueBoldItalicAsset);
const EXPENSIFY_NEW_KANSAS_MEDIUM = chartWebFont(expensifyNewKansasMediumAsset);
const EXPENSIFY_NEW_KANSAS_MEDIUM_ITALIC = chartWebFont(expensifyNewKansasMediumItalicAsset);
const CUSTOM_EMOJI_FONT = chartWebFont(customEmojiFontAsset);
const SANS_SYMBOLS_FONT = chartWebFont(sansSymbolsFontAsset);
const SANS_SC_MONTHS_FONT = chartWebFont(sansScMonthsFontAsset);

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
