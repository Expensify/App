import _ from 'underscore';
import * as Environment from './Environment/Environment';
import CONST from '../CONST';

/**
 * @private
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseAllBetas(betas) {
    return Environment.isDevelopment() || _.contains(betas, CONST.BETAS.ALL);
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
    return _.contains(betas, CONST.BETAS.IOU_SEND) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseWallet(betas) {
    return _.contains(betas, CONST.BETAS.BETA_EXPENSIFY_WALLET) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseCommentLinking(betas) {
    return _.contains(betas, CONST.BETAS.BETA_COMMENT_LINKING) || canUseAllBetas(betas);
}

/**
 * We're requiring you to be added to the policy rooms beta on dev,
 * since contributors have been reporting a number of false issues related to the feature being under development.
 * See https://expensify.slack.com/archives/C01GTK53T8Q/p1641921996319400?thread_ts=1641598356.166900&cid=C01GTK53T8Q
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUsePolicyRooms(betas) {
    return _.contains(betas, CONST.BETAS.POLICY_ROOMS) || _.contains(betas, CONST.BETAS.ALL);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUsePolicyExpenseChat(betas) {
    return _.contains(betas, CONST.BETAS.POLICY_EXPENSE_CHAT) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUsePasswordlessLogins(betas) {
    return _.contains(betas, CONST.BETAS.PASSWORDLESS) || canUseAllBetas(betas);
}

export default {
    canUseChronos,
    canUseIOU,
    canUsePayWithExpensify,
    canUseDefaultRooms,
    canUseInternationalization,
    canUseIOUSend,
    canUseWallet,
    canUseCommentLinking,
    canUsePolicyRooms,
    canUsePolicyExpenseChat,
    canUsePasswordlessLogins,
};
