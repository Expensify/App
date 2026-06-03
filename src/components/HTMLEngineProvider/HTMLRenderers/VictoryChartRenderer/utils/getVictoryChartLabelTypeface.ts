import type {SkTypeface} from '@shopify/react-native-skia';
import type {ChartDefaultTypeface} from '@components/Charts/hooks';

/** Matches `fontFamily` in Victory HTML from Web-Expensify (e.g. proactive CFO polar charts). */
const EXPENSIFY_NEW_KANSAS_FONT_FAMILY = 'Expensify New Kansas';

function getVictoryChartLabelTypeface(fontFamily: string | undefined, fontWeight: 'normal' | 'bold' | undefined, typefaces: ChartDefaultTypeface): SkTypeface | null {
    if (fontFamily === EXPENSIFY_NEW_KANSAS_FONT_FAMILY) {
        return typefaces.kansas;
    }

    return fontWeight === 'bold' ? typefaces.bold : typefaces.regular;
}

export default getVictoryChartLabelTypeface;
