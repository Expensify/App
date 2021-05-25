import _ from 'underscore';
import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

let betas;
Onyx.connect({
    key: ONYXKEYS.BETAS,
    callback: val => betas = val || [],
});

const isDevelopment = lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV;

/**
 * @private
 * @returns {Boolean}
 */
function canUseAllBetas() {
    return isDevelopment || _.contains(betas, CONST.BETAS.ALL);
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
