/**
 * The subset of a text style that affects how wide a string renders.
 */
type MeasurableFont = {
    /** Font size in px. Defaults to the app's normal text size. */
    fontSize?: number;

    /** CSS font weight, e.g. `'400'` or `'700'`. Defaults to the normal weight. */
    fontWeight?: string;

    /** Font family stack. Defaults to Expensify Neue. */
    fontFamily?: string;
};

/**
 * Measures how wide `text` renders in the given font, in px.
 *
 * Returns `null` when the platform cannot measure text synchronously (i.e. everywhere except the web), which callers
 * must treat as "no measurement available" and fall back to a layout that doesn't depend on content width.
 */
type MeasureTextWidth = (text: string, font?: MeasurableFont) => number | null;

/**
 * Whether this platform can measure text at all. Lets a caller skip the work of gathering text to measure on platforms
 * where every measurement would come back `null` anyway.
 */
type CanMeasureText = () => boolean;

export type {MeasurableFont, MeasureTextWidth, CanMeasureText};
