import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useFonts, useTypeface} from '@shopify/react-native-skia';
import chartWebFont from '@components/Charts/context/chartWebFont';

function useChartFontManager(): SkTypefaceFontProvider | null {
    return useFonts({
        ExpensifyNeue: [
            chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string),
            chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string),
            chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Italic.woff2') as string),
            chartWebFont(require('@assets/fonts/web/ExpensifyNeue-BoldItalic.woff2') as string),
        ],
        NotoSansSymbols: [chartWebFont(require('@assets/fonts/NotoSans-Symbols.ttf') as string)],
        NotoSansSCMonths: [chartWebFont(require('@assets/fonts/NotoSansSC-Months.ttf') as string)],
    });
}

function useChartDefaultTypeface() {
    const regular = useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string));
    const bold = useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string));
    return {regular, bold};
}

export {useChartDefaultTypeface};
export default useChartFontManager;
