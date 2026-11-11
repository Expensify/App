/**
 * Creates the Skia fonts that chart text is drawn with.
 *
 * A chart narrower than its design width is rendered with fonts at a fractional, often small size (6.6px for an
 * 11px label at 0.6). With Skia's default font settings, glyph positions and advances are hinted and snapped to
 * whole pixels, so small text is unevenly spaced and a colon can collapse into its neighbors. Subpixel
 * positioning with linear metrics and no hinting lays the text out at its exact size, so a fitted chart reads
 * like a proportionally smaller copy of the design-size one.
 */
import type {SkFont, SkTypeface} from '@shopify/react-native-skia';

import {FontHinting, Skia} from '@shopify/react-native-skia';

function createVictoryChartFont(typeface: SkTypeface, size: number): SkFont {
    const font = Skia.Font(typeface, size);
    font.setSubpixel(true);
    font.setLinearMetrics(true);
    font.setHinting(FontHinting.None);
    return font;
}

export default createVictoryChartFont;
