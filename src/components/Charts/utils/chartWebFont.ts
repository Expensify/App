import type {DataModule} from '@shopify/react-native-skia';

function chartWebFont(url: number | string): DataModule {
    // Skia accepts an ES module wrapper for web asset URLs and Metro's numeric asset IDs.
    // Numeric defaults remain unsupported by the cache so Jest asset handling keeps its behavior.
    return {__esModule: true, default: url};
}

export default chartWebFont;
