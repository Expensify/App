/** Minimum height for the chart content area (bars, Y-axis, grid lines) */
const CHART_CONTENT_MIN_HEIGHT = 250;

/** Supported label rotation angles in degrees */
const LABEL_ROTATIONS = {
    HORIZONTAL: 0,
    DIAGONAL: 45,
    VERTICAL: 90,
} as const;

const SIN_45 = Math.sin(Math.PI / 4);

/** Minimum gap between adjacent labels (px) */
const LABEL_PADDING = 4;

const ELLIPSIS = '...';

/** Minimum visible characters (excluding ellipsis) for truncation to be worthwhile */
const MIN_TRUNCATED_CHARS = 10;

/** Radian threshold separating diagonal from vertical label hit-test */
const DIAGONAL_ANGLE_RADIAN_THRESHOLD = 1;

// Maximum width for Y-axis labels in pixels
const MAX_Y_AXIS_LABEL_WIDTH = 200;

// Maximum width for X-axis labels in pixels
const MAX_X_AXIS_LABEL_WIDTH = 500;

// Small extra padding so complex glyphs (e.g. Arabic) are not clipped.
// getLongestLine() can slightly under-report the visual extent of the last glyph.
const GLYPH_PADDING = 4;

export {
    CHART_CONTENT_MIN_HEIGHT,
    LABEL_ROTATIONS,
    SIN_45,
    LABEL_PADDING,
    ELLIPSIS,
    MIN_TRUNCATED_CHARS,
    DIAGONAL_ANGLE_RADIAN_THRESHOLD,
    MAX_X_AXIS_LABEL_WIDTH,
    MAX_Y_AXIS_LABEL_WIDTH,
    GLYPH_PADDING,
};
