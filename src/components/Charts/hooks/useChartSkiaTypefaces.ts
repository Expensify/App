import {useTypeface} from '@shopify/react-native-skia';
import type {ChartDefaultTypeface} from '../types/chartSkiaTypefaceTypes';
import chartWebFont from '../utils/chartWebFont';

function useChartSkiaTypefaces(): ChartDefaultTypeface {
    return {
        MONOSPACE: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyMono-Regular.woff2') as string)),
        MONOSPACE_BOLD: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyMono-Bold.woff2') as string)),
        MONOSPACE_ITALIC: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyMono-Italic.woff2') as string)),
        MONOSPACE_BOLD_ITALIC: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyMono-BoldItalic.woff2') as string)),
        EXP_NEUE: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string)),
        EXP_NEUE_BOLD: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string)),
        EXP_NEUE_ITALIC: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Italic.woff2') as string)),
        EXP_NEUE_BOLD_ITALIC: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNeue-BoldItalic.woff2') as string)),
        EXP_NEW_KANSAS_MEDIUM: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNewKansas-Medium.woff2') as string)),
        EXP_NEW_KANSAS_MEDIUM_ITALIC: useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNewKansas-MediumItalic.woff2') as string)),
        CUSTOM_EMOJI_FONT: useTypeface(chartWebFont(require('@assets/fonts/web/CustomEmojiWebFont.ttf') as string)),
    };
}

export default useChartSkiaTypefaces;
