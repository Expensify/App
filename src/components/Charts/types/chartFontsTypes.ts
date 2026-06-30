import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {ChartDefaultTypeface} from './chartSkiaTypefaceTypes';

type ChartFontsValue = {
    typefaces: ChartDefaultTypeface;
    fontManager: SkTypefaceFontProvider | null;
};

export default ChartFontsValue;
