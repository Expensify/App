import _ from 'underscore';
import CONST from '../CONST';

/**
 * @private
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseAllBetas(betas) {
    return _.contains(betas, CONST.BETAS.ALL);
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
 * IOU Send feature is temporarily disabled.
 *
 * @returns {Boolean}
 */
function canUseIOUSend() {
    return false;
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
    return _.contains(betas, CONST.BETAS.POLICY_ROOMS) || canUseAllBetas(betas);
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
function canUseTasks(betas) {
    return _.contains(betas, CONST.BETAS.TASKS) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseScanReceipts(betas) {
    return _.contains(betas, CONST.BETAS.SCAN_RECEIPTS) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseCustomStatus(betas) {
    return _.contains(betas, CONST.BETAS.CUSTOM_STATUS) || canUseAllBetas(betas);
}

/**
 * @param {Array<String>} betas
 * @returns {Boolean}
 */
function canUseDistanceRequests(betas) {
    return _.contains(betas, CONST.BETAS.DISTANCE_REQUESTS) || canUseAllBetas(betas);
}

/**
 * Link previews are temporarily disabled.
 * @returns {Boolean}
 */
function canUseLinkPreviews() {
    return false;
}

export default {
    canUseChronos,
    canUsePayWithExpensify,
    canUseDefaultRooms,
    canUseIOUSend,
    canUseWallet,
    canUseCommentLinking,
    canUsePolicyRooms,
    canUsePolicyExpenseChat,
    canUseTasks,
    canUseScanReceipts,
    canUseCustomStatus,
    canUseDistanceRequests,
    canUseLinkPreviews,
};
