import type {DataModule, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {useFonts} from '@shopify/react-native-skia';

function webFont(url: string): DataModule {
    // We construct a fake ESModule-shaped object because react-native-skia's `useFonts` on web expects
    // a DataModule (i.e. the result of a dynamic `require()` call), which always has the shape
    // `{ __esModule: true, default: <url> }`. The `__esModule` property uses a double-underscore prefix
    // that violates the naming-convention rule, but it is mandated by the library's internal contract.
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
