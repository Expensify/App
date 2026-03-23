import type {DataModule, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useFonts} from '@shopify/react-native-skia';

function webFont(url: string): DataModule {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return {__esModule: true, default: url} as unknown as DataModule;
}

function useChartFontManager(): SkTypefaceFontProvider | null {
    return useFonts({
        ExpensifyNeue: [
            webFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-Italic.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-BoldItalic.woff2') as string),
        ],
        NotoSansSymbols: [webFont(require('@assets/fonts/NotoSans-Symbols.ttf') as string)],
    });
}

export default useChartFontManager;
