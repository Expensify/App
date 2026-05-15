import type {DataModule, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useFonts, useTypeface} from '@shopify/react-native-skia';

function useChartFontManager(): SkTypefaceFontProvider | null {
    return useFonts({
        ExpensifyNeue: [
            require('@assets/fonts/native/ExpensifyNeue-Regular.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyNeue-Bold.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyNeue-Italic.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyNeue-BoldItalic.otf') as DataModule,
        ],
        NotoSansSymbols: [require('@assets/fonts/NotoSans-Symbols.ttf') as DataModule],
        NotoSansSCMonths: [require('@assets/fonts/NotoSansSC-Months.ttf') as DataModule],
    });
}

function useChartDefaultTypeface() {
    return useTypeface(require('@assets/fonts/native/ExpensifyNeue-Regular.otf') as DataModule);
}

export {useChartDefaultTypeface};
export default useChartFontManager;
