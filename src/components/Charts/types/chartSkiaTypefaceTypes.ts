import type {SkTypeface} from '@shopify/react-native-skia';
// eslint-disable-next-line no-restricted-imports
import type FontFamilyStyles from '@styles/utils/FontUtils/fontFamily/types';

type ChartSkiaTypefaceKey = Exclude<keyof FontFamilyStyles, 'SYSTEM'>;

type ChartDefaultTypeface = Record<ChartSkiaTypefaceKey, SkTypeface | null>;

export type {ChartDefaultTypeface, ChartSkiaTypefaceKey};
