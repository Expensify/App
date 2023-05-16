import _ from 'underscore';
import CONST from '../../CONST';

let active = false;

/**
 * Debounced function to deactive the TooltipSense after a specific time
 */
const debouncedDeactivate = _.debounce(() => {
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
