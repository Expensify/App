import type {DataModule} from '@shopify/react-native-skia';

function chartWebFont(url: string): DataModule {
    // We construct a fake ESModule-shaped object because react-native-skia's `useFonts` on web expects
    // a DataModule (i.e. the result of a dynamic `require()` call), which always has the shape
    // `{ __esModule: true, default: <url> }`. The `__esModule` property uses a double-underscore prefix
    // that violates the naming-convention rule, but it is mandated by the library's internal contract.
    return {__esModule: true, default: url} as unknown as DataModule;
}

export default chartWebFont;
