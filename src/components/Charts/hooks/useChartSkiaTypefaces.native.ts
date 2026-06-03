import type {DataModule} from '@shopify/react-native-skia';
import {useTypeface} from '@shopify/react-native-skia';
import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';

function useChartSkiaTypefaces(): ChartDefaultTypeface {
    return {
        MONOSPACE: useTypeface(require('@assets/fonts/native/ExpensifyMono-Regular.otf') as DataModule),
        MONOSPACE_BOLD: useTypeface(require('@assets/fonts/native/ExpensifyMono-Bold.otf') as DataModule),
        MONOSPACE_ITALIC: useTypeface(require('@assets/fonts/native/ExpensifyMono-Italic.otf') as DataModule),
        MONOSPACE_BOLD_ITALIC: useTypeface(require('@assets/fonts/native/ExpensifyMono-BoldItalic.otf') as DataModule),
        EXP_NEUE: useTypeface(require('@assets/fonts/native/ExpensifyNeue-Regular.otf') as DataModule),
        EXP_NEUE_BOLD: useTypeface(require('@assets/fonts/native/ExpensifyNeue-Bold.otf') as DataModule),
        EXP_NEUE_ITALIC: useTypeface(require('@assets/fonts/native/ExpensifyNeue-Italic.otf') as DataModule),
        EXP_NEUE_BOLD_ITALIC: useTypeface(require('@assets/fonts/native/ExpensifyNeue-BoldItalic.otf') as DataModule),
        EXP_NEW_KANSAS_MEDIUM: useTypeface(require('@assets/fonts/native/ExpensifyNewKansas-Medium.otf') as DataModule),
        EXP_NEW_KANSAS_MEDIUM_ITALIC: useTypeface(require('@assets/fonts/native/ExpensifyNewKansas-MediumItalic.otf') as DataModule),
        CUSTOM_EMOJI_FONT: useTypeface(require('@assets/fonts/native/CustomEmojiNativeFont.ttf') as DataModule),
    };
}

export default useChartSkiaTypefaces;
