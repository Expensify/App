import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useFonts} from '@shopify/react-native-skia';
import webFont from '@components/Charts/context/chartWebFont';

function useChartFontManager(): SkTypefaceFontProvider | null {
    return useFonts({
        ExpensifyNeue: [
            webFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-Italic.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-BoldItalic.woff2') as string),
        ],
        NotoSansSymbols: [webFont(require('@assets/fonts/NotoSans-Symbols.ttf') as string)],
        NotoSansSCMonths: [webFont(require('@assets/fonts/NotoSansSC-Months.ttf') as string)],
    });
}

export default useChartFontManager;
