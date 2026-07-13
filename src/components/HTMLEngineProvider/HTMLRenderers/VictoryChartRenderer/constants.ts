/** Keys for cartesian data objects */
const X_KEY = 'x';
const Y_KEY_PREFIX = 'y';

/** Keys for polar data objects */
const LABEL_KEY = 'label';
const VALUE_KEY = 'value';
const COLOR_KEY = 'color';

const CHART_TYPE = {
    CARTESIAN: 'cartesian',
    POLAR: 'polar',
} as const;

/** Gap left between a left-axis label and the chart's outer edge when `padding.left` is shrunk to fit the label content. */
const LEFT_AXIS_LABEL_PADDING = 32;

/** Max gap between a left-axis label and the chart it labels, clamping the XML-provided `tickLabels.padding` when that value is larger. */
const LEFT_AXIS_LABEL_OFFSET_MAX = 16;

export {X_KEY, Y_KEY_PREFIX, LABEL_KEY, VALUE_KEY, COLOR_KEY, CHART_TYPE, LEFT_AXIS_LABEL_PADDING, LEFT_AXIS_LABEL_OFFSET_MAX};
