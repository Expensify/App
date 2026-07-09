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

/**
 * Polar charts are circular but their design canvas is often taller than the
 * visible content, leaving dead space at the bottom. Containers clip to this
 * ratio of the design height so the unused bottom portion is hidden.
 */
const POLAR_CONTAINER_HEIGHT_RATIO = 0.9;

export {X_KEY, Y_KEY_PREFIX, LABEL_KEY, VALUE_KEY, COLOR_KEY, CHART_TYPE, POLAR_CONTAINER_HEIGHT_RATIO};
