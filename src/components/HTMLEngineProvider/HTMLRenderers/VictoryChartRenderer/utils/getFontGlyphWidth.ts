import type {SkFont} from '@shopify/react-native-skia';

/**
 * Sums glyph advance widths for `text`. Mirrors victory-native's internal label-width
 * calculation so measurements line up with what `CartesianAxis` actually renders.
 */
function getFontGlyphWidth(text: string, font: SkFont | null): number {
    if (!font) {
        return 0;
    }
    return font.getGlyphWidths(font.getGlyphIDs(text)).reduce((sum, width) => sum + width, 0);
}

export default getFontGlyphWidth;
