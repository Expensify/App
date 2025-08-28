import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

// eslint-disable-next-line rulesdir/no-beta-handler
function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

// eslint-disable-next-line rulesdir/no-beta-handler
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
    // Remove this check once the manual distance tracking feature is fully rolled out
    if (beta === CONST.BETAS.MANUAL_DISTANCE) {
        return false;
    }

    if (beta === CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS) {
        return false;
    }

    return !!betas?.includes(beta) || canUseAllBetas(betas);
}

export default {
    canUseLinkPreviews,
    isBlockedFromSpotnanaTravel,
    isBetaEnabled,
};
