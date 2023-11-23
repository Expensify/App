import CONST from '@src/CONST';
import Beta from '@src/types/onyx/Beta';

function canUseAllBetas(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.ALL);
}

function canUseChronos(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.CHRONOS_IN_CASH) || canUseAllBetas(betas);
}

function canUsePayWithExpensify(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.PAY_WITH_EXPENSIFY) || canUseAllBetas(betas);
}

function canUseDefaultRooms(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

function canUseWallet(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.BETA_EXPENSIFY_WALLET) || canUseAllBetas(betas);
}

function canUseCommentLinking(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.BETA_COMMENT_LINKING) || canUseAllBetas(betas);
}

/**
 * We're requiring you to be added to the policy rooms beta on dev,
 * since contributors have been reporting a number of false issues related to the feature being under development.
 * See https://expensify.slack.com/archives/C01GTK53T8Q/p1641921996319400?thread_ts=1641598356.166900&cid=C01GTK53T8Q
 */
function canUsePolicyRooms(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.POLICY_ROOMS) || canUseAllBetas(betas);
}

function canUseTasks(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.TASKS) || canUseAllBetas(betas);
}

function canUseCustomStatus(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.CUSTOM_STATUS) || canUseAllBetas(betas);
}

function canUseViolations(betas: Beta[]): boolean {
    return betas?.includes(CONST.BETAS.VIOLATIONS) || canUseAllBetas(betas);
}

/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews(): boolean {
    return false;
}

export default {
    canUseChronos,
    canUsePayWithExpensify,
    canUseDefaultRooms,
    canUseWallet,
    canUseCommentLinking,
    canUsePolicyRooms,
    canUseTasks,
    canUseCustomStatus,
    canUseLinkPreviews,
    canUseViolations,
};
