import type {DataModule} from '@shopify/react-native-skia';

function chartWebFont(url: number | string): DataModule {
    // Web font URLs need a module wrapper for Skia's DataModule and useFonts interop.
    // Skia requires the __esModule marker with this exact spelling.
    return {__esModule: true, default: url};
}

export default chartWebFont;
