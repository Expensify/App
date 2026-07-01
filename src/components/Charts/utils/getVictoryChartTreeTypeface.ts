import type {SkTypeface} from '@shopify/react-native-skia';
import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';
import getChartSkiaTypeface from './getChartSkiaTypeface';

function getVictoryChartTreeTypeface(typefaces: ChartDefaultTypeface): SkTypeface | null {
    return getChartSkiaTypeface(typefaces, {});
}

export default getVictoryChartTreeTypeface;
