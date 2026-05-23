const X_KEY = 'x';
const Y_KEY_PREFIX = 'y';

const POLAR_LABEL_KEY = 'polarLabel' as const;
const POLAR_VALUE_KEY = 'polarValue' as const;
const POLAR_COLOR_KEY = 'polarColor' as const;

const CHART_TYPE = {
    CARTESIAN: 'cartesian',
    POLAR: 'polar',
} as const;

export {X_KEY, Y_KEY_PREFIX, POLAR_LABEL_KEY, POLAR_VALUE_KEY, POLAR_COLOR_KEY, CHART_TYPE};
