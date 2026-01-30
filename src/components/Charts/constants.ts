import type { Color } from '@shopify/react-native-skia';
import type { RoundedCorners } from 'victory-native';
import colors from '@styles/theme/colors';

/**
 * Chart color palette from Figma design.
 * Colors cycle when there are more data points than colors.
 */
const CHART_COLORS: Color[] = [colors.yellow400, colors.tangerine400, colors.pink400, colors.green400, colors.ice400];

/** Number of Y-axis ticks (including zero) */
const Y_AXIS_TICK_COUNT = 5;

/** Inner padding between bars (0.3 = 30% of bar width) */
const BAR_INNER_PADDING = 0.3;

/** Domain padding configuration for the chart */
const DOMAIN_PADDING = {
    left: 0,
    right: 16,
    top: 30,
    bottom: 10,
};

/** Distance between Y-axis labels and the chart */
const Y_AXIS_LABEL_OFFSET = 16;

/** Rounded corners radius for bars */
const BAR_CORNER_RADIUS = 8;

/** Rounded corners configuration for bars */
const BAR_ROUNDED_CORNERS: RoundedCorners = {
    topLeft: BAR_CORNER_RADIUS,
    topRight: BAR_CORNER_RADIUS,
    bottomLeft: BAR_CORNER_RADIUS,
    bottomRight: BAR_CORNER_RADIUS,
};

/** Chart padding */
const CHART_PADDING = 5;

/** Minimum height for the chart content area (bars, Y-axis, grid lines) */
const CHART_CONTENT_MIN_HEIGHT = 250;

/** Default bar color index when useSingleColor is true (ice blue) */
const DEFAULT_SINGLE_BAR_COLOR_INDEX = 4;

/** Safety buffer multiplier for domain padding calculation */
const DOMAIN_PADDING_SAFETY_BUFFER = 1.1;

/** Line width for X-axis (hidden) */
const X_AXIS_LINE_WIDTH = 0;

/** Line width for Y-axis grid lines */
const Y_AXIS_LINE_WIDTH = 1;

/** Line width for frame (hidden) */
const FRAME_LINE_WIDTH = 0;

/** The height of the chart tooltip pointer */
const TOOLTIP_POINTER_HEIGHT = 4;

/** The width of the chart tooltip pointer */
const TOOLTIP_POINTER_WIDTH = 12;

/** Gap between bar top and tooltip bottom */
const TOOLTIP_BAR_GAP = 8;

/** Rotation angle for X-axis labels - 45 degrees (in degrees) */
const X_AXIS_LABEL_ROTATION_45 = -45;

/** Rotation angle for X-axis labels - 90 degrees (in degrees) */
const X_AXIS_LABEL_ROTATION_90 = -90;

/** Sin of 45 degrees - used to calculate effective width of rotated labels */
const SIN_45_DEGREES = Math.sin(Math.PI / 4); // ≈ 0.707

/** Minimum padding between labels (in pixels) */
const LABEL_PADDING = 4;

/** Maximum ratio of container height that X-axis labels can occupy.
 * Victory allocates: fontHeight + yLabelOffset * 2 + rotateOffset.
 * With fontHeight ~12px and yLabelOffset = 16, base is ~44px.
 * This ratio limits total label area to prevent labels from taking too much space. */
const X_AXIS_LABEL_MAX_HEIGHT_RATIO = 0.35;

/** Ellipsis character for truncated labels */
const LABEL_ELLIPSIS = '...';

/** Minimum percentage for a slice to be shown individually (slices below this are aggregated to "Other") */
const PIE_CHART_MIN_SLICE_PERCENTAGE = 2;

/** Maximum number of slices before aggregating smallest to "Other" */
const PIE_CHART_MAX_SLICES = 20;

/** Label for aggregated small slices */
const PIE_CHART_OTHER_LABEL = 'Other';

/** Starting angle for pie chart (0 = 3 o'clock, -90 = 12 o'clock) */
const PIE_CHART_START_ANGLE = -90;

export {
    CHART_COLORS,
    Y_AXIS_TICK_COUNT,
    BAR_INNER_PADDING,
    DOMAIN_PADDING,
    Y_AXIS_LABEL_OFFSET,
    BAR_ROUNDED_CORNERS,
    CHART_PADDING,
    CHART_CONTENT_MIN_HEIGHT,
    DEFAULT_SINGLE_BAR_COLOR_INDEX,
    DOMAIN_PADDING_SAFETY_BUFFER,
    X_AXIS_LINE_WIDTH,
    Y_AXIS_LINE_WIDTH,
    FRAME_LINE_WIDTH,
    TOOLTIP_POINTER_HEIGHT,
    TOOLTIP_POINTER_WIDTH,
    TOOLTIP_BAR_GAP,
    X_AXIS_LABEL_ROTATION_45,
    X_AXIS_LABEL_ROTATION_90,
    SIN_45_DEGREES,
    LABEL_PADDING,
    X_AXIS_LABEL_MAX_HEIGHT_RATIO,
    LABEL_ELLIPSIS,
    PIE_CHART_MIN_SLICE_PERCENTAGE,
    PIE_CHART_MAX_SLICES,
    PIE_CHART_OTHER_LABEL,
    PIE_CHART_START_ANGLE,
};
