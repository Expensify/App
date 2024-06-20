import lodashDebounce from 'lodash/debounce';
import CONST from '@src/CONST';

let active = false;

/**
 * Debounced function to deactive the TooltipSense after a specific time
 */
const debouncedDeactivate = lodashDebounce(() => {
    active = false;
}, CONST.TIMING.TOOLTIP_SENSE);

function activate() {
    active = true;
    debouncedDeactivate.cancel();
}

function deactivate() {
    return debouncedDeactivate();
}

function isActive() {
    return active === true;
}

export default {
    activate,
    deactivate,
    isActive,
};
