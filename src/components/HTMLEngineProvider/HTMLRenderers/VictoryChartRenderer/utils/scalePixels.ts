/**
 * Scales a pixel-space value by a uniform factor, passing `undefined` through — the shared
 * primitive for re-rendering a chart's parsed pixel attributes at a different size.
 */
function scalePixels(value: number, scale: number): number;
function scalePixels(value: number | undefined, scale: number): number | undefined;
function scalePixels(value: number | undefined, scale: number): number | undefined {
    return value === undefined ? undefined : value * scale;
}

export default scalePixels;
