type RGB = {r: number; g: number; b: number};

/**
 * Parses a 6-digit CSS hex color string (with or without leading #) into
 * normalized [0, 1] RGB channels.
 */
function hexToRGB(hex: string): RGB {
    const s = hex.replace('#', '');
    return {
        r: parseInt(s.slice(0, 2), 16) / 255,
        g: parseInt(s.slice(2, 4), 16) / 255,
        b: parseInt(s.slice(4, 6), 16) / 255,
    };
}

/**
 * Computes the WCAG 2.1 relative luminance of a hex color.
 * Returns a value in [0, 1] where 0 = black and 1 = white.
 * https://www.w3.org/TR/WCAG21/#relative-luminance
 */
function getRelativeLuminance(hex: string): number {
    const {r, g, b} = hexToRGB(hex);
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export type {RGB};
export {hexToRGB, getRelativeLuminance};
