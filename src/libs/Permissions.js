import _ from 'underscore';
import {isDevelopment} from './Environment/Environment';
import CONST from '../CONST';

/**
 * @private
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseAllBetas(betas) {
    return isDevelopment() || _.contains(betas, CONST.BETAS.ALL);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseChronos(betas) {
    return _.contains(betas, CONST.BETAS.CHRONOS_IN_CASH) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseIOU(betas) {
    return _.contains(betas, CONST.BETAS.IOU) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUsePayWithExpensify(betas) {
    return _.contains(betas, CONST.BETAS.PAY_WITH_EXPENSIFY) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseFreePlan(betas) {
    return _.contains(betas, CONST.BETAS.FREE_PLAN) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseDefaultRooms(betas) {
    return _.contains(betas, CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseInternationalization(betas) {
    return _.contains(betas, CONST.BETAS.INTERNATIONALIZATION) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseIOUSend(betas) {
    return _.contains(betas, CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

export default {
    canUseChronos,
    canUseIOU,
    canUsePayWithExpensify,
    canUseFreePlan,
    canUseDefaultRooms,
    canUseInternationalization,
    canUseIOUSend,
};
