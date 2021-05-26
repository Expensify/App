import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Environment from './Environment';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

let betas;
Onyx.connect({
    key: ONYXKEYS.BETAS,
    callback: val => betas = val || [],
});

/**
 * @private
 * @returns {Boolean}
 */
function canUseAllBetas() {
    return Environment.isDevelopment() || _.contains(betas, CONST.BETAS.ALL);
}

/**
 * @returns {Boolean}
 */
function canUseChronos() {
    return _.contains(betas, CONST.BETAS.CHRONOS_IN_CASH) || canUseAllBetas();
}

/**
 * @returns {Boolean}
 */
function canUseIOU() {
    return _.contains(betas, CONST.BETAS.IOU) || canUseAllBetas();
}

export default {
    canUseChronos,
    canUseIOU,
};
