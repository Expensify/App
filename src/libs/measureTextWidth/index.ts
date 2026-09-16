import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import type {CanMeasureText, MeasurableFont, MeasureTextWidth} from './types';

/**
 * Upper bound on cached measurements. Text measurement is only used to size layouts, so a coarse cap is enough to keep
 * the cache from growing without bound on long-lived sessions.
 */
const MAX_CACHE_SIZE = 5000;

const measurementCache = new Map<string, number>();

let measurementContext: CanvasRenderingContext2D | null | undefined;

/**
 * Lazily creates the offscreen 2d context used for measurement. Measuring through a canvas costs no layout or reflow,
 * unlike measuring by mounting text into the document.
 */
function getMeasurementContext(): CanvasRenderingContext2D | null {
    if (measurementContext !== undefined) {
        return measurementContext;
    }

    if (typeof document === 'undefined') {
        measurementContext = null;
        return measurementContext;
    }

    measurementContext = document.createElement('canvas').getContext('2d');
    return measurementContext;
}

/**
 * Builds a CSS `font` shorthand from the measurable parts of a text style.
 */
function getFontShorthand({fontSize, fontWeight, fontFamily}: MeasurableFont): string {
    const size = fontSize ?? variables.fontSizeNormal;
    const weight = fontWeight ?? FontUtils.fontWeight.normal;
    const family = fontFamily ?? FontUtils.fontFamily.platform.EXP_NEUE.fontFamily;

    return `${weight} ${size}px ${family}`;
}

/**
 * Measures how wide `text` renders in the given font, in px.
 *
 * Web measures through a canvas, so this is synchronous and does not touch the document's layout.
 */
const measureTextWidth: MeasureTextWidth = (text, font = {}) => {
    if (!text) {
        return 0;
    }

    const context = getMeasurementContext();

    if (!context) {
        return null;
    }

    const fontShorthand = getFontShorthand(font);
    const cacheKey = `${fontShorthand}|${text}`;
    const cachedWidth = measurementCache.get(cacheKey);

    if (cachedWidth !== undefined) {
        return cachedWidth;
    }

    context.font = fontShorthand;
    const width = context.measureText(text).width;

    if (measurementCache.size >= MAX_CACHE_SIZE) {
        measurementCache.clear();
    }

    measurementCache.set(cacheKey, width);

    return width;
};

const canMeasureText: CanMeasureText = () => getMeasurementContext() !== null;

export default measureTextWidth;
export {canMeasureText};
