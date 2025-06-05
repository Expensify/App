import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

function isBlockedFromSpotnanaTravel(betas: OnyxEntry<Beta[]>): boolean {
    // Don't check for all betas or nobody can use test travel on dev
    return !!betas?.includes(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);
}

/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews(): boolean {
    return false;
}

function isBetaEnabled(beta: Beta, betas: OnyxEntry<Beta[]>): boolean {
    // This beta has been released to everyone, but in case user does not have the NVP loaded, we need to return true here.
    // Will be removed in this issue https://github.com/Expensify/App/issues/63254
    if (beta === CONST.BETAS.TABLE_REPORT_VIEW) {
        return true;
    }
    return !!betas?.includes(beta) || canUseAllBetas(betas);
}

export default {
    canUseLinkPreviews,
    isBlockedFromSpotnanaTravel,
    isBetaEnabled,
};
