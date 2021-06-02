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

export default {
    canUseChronos,
    canUseIOU,
};
