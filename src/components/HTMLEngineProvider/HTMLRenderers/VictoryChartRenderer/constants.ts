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

export {X_KEY, Y_KEY_PREFIX, LABEL_KEY, VALUE_KEY, COLOR_KEY, CHART_TYPE};
