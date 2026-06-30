import type {SkFont} from '@shopify/react-native-skia';

type SkiaLineMetrics = {
    /** Distance from the baseline up to the glyph tops, as a positive value. */
    ascent: number;
    /** Distance from the baseline down to the glyph bottoms, as a positive value. */
    descent: number;
    /** Extra spacing requested by the font between consecutive lines. */
    leading: number;
    /** Conventional, always non-negative line height (`ascent + descent + leading`). */
    lineHeight: number;
};

function getSkiaLineMetrics(font: SkFont | null): SkiaLineMetrics {
    const metrics = font?.getMetrics();
    if (!metrics) {
        return {ascent: 0, descent: 0, leading: 0, lineHeight: 0};
    }
    const ascent = Math.abs(metrics.ascent);
    const descent = Math.abs(metrics.descent);
    const leading = Math.abs(metrics.leading);
    return {ascent, descent, leading, lineHeight: ascent + descent + leading};
}

export default getSkiaLineMetrics;
