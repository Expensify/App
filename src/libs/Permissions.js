import _ from 'underscore';
import Onyx from 'react-native-onyx';
import {isDevelopment} from './Environment/Environment';
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
    return isDevelopment() || _.contains(betas, CONST.BETAS.ALL);
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

/**
 * @returns {Boolean}
 */
function canUsePayWithExpensify() {
    return _.contains(betas, CONST.BETAS.PAY_WITH_EXPENSIFY) || canUseAllBetas();
}

/**
 * @returns {Boolean}
 */
function canUseFreePlan() {
    return _.contains(betas, CONST.BETAS.FREE_PLAN) || canUseAllBetas();
}

export default {
    canUseChronos,
    canUseIOU,
    canUsePayWithExpensify,
    canUseFreePlan,
};
