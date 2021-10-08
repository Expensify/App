import _ from 'underscore';
import CONST from '../../CONST';

let active = false;
const debouncedDeactivate = _.debounce(() => {
    active = false;
}, CONST.TIMING.TOOLTIP_SENSE);

function activate() {
    active = true;
    debouncedDeactivate.cancel();
}

function isActive() {
    return active === true;
}

function deactivate() {
    return debouncedDeactivate();
}

export default {
    activate,
    deactivate,
    isActive,
};
