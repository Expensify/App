import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

// A list of betas that require being explicitly enabled, and will not be enabled merely by the 'all' beta.
// QA accounts have the 'all' beta enabled, so this allows us to deploy incomplete pieces of features under a beta without QA testing running and creating a bunch of deploy blocker issues.
// When the feature is ready for QA, the beta can be removed from the list, and the feature can be QAed before being released to all users.
const EXPLICIT_ONLY_BETAS = new Set<Beta>([
    CONST.BETAS.AUTH_AUTO_REPORT_TITLE,
    CONST.BETAS.MANUAL_DISTANCE,
]);

// These betas exclude or prevent accounts from accessing a specific feature. They are useful for disabling features for entire domains.
// Similar to the EXPLICIT_ONLY_BETAS, these betas are not enabled by the 'all' beta.
// The 'all' beta adds users to all features, so if it were to also add users to exclusion betas it would be contradicting its purpose.
const EXCLUSION_BETAS = new Set<Beta>([
    CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS,
]);

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
    const hasAllBetasEnabled = canUseAllBetas(betas);
    const isFeatureEnabled = !!betas?.includes(beta);

    // Explicit only betas and exclusion betas are not enabled only by the 'all' beta. See the comments on these beta list definitions for more details.
    if ((EXPLICIT_ONLY_BETAS.has(beta) || EXCLUSION_BETAS.has(beta)) && hasAllBetasEnabled && !isFeatureEnabled) {
        return false;
    }

    return isFeatureEnabled || hasAllBetasEnabled;
}

export default {
    canUseLinkPreviews,
    isBlockedFromSpotnanaTravel,
    isBetaEnabled,
};
