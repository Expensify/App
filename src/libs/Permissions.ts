import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';
import type BetaConfiguration from '@src/types/onyx/BetaConfiguration';

// eslint-disable-next-line rulesdir/no-beta-handler
function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return true;
    return !!betas?.includes(CONST.BETAS.ALL);
}

/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews(): boolean {
    return false;
}

function isBetaEnabled(beta: Beta, betas: OnyxEntry<Beta[]>, betaConfiguration?: OnyxEntry<BetaConfiguration>): boolean {
    const hasAllBetasEnabled = canUseAllBetas(betas);
    const isFeatureEnabled = !!betas?.includes(beta);

    // Explicit only betas and exclusion betas are not enabled only by the 'all' beta. Explicit only betas must be set explicitly to enable the feature.
    // Exclusion betas are designed to disable features, so being on the 'all' beta should not disable these features as that contradicts its purpose.
    if (((betaConfiguration?.explicitOnly?.includes(beta) ?? false) || (betaConfiguration?.exclusion?.includes(beta) ?? false)) && hasAllBetasEnabled && !isFeatureEnabled) {
        return false;
    }

    return isFeatureEnabled || hasAllBetasEnabled;
}

/**
 * Track flows are temporarily disabled.
 */
function canUseTrackFlows(): boolean {
    return false;
}

export default {
    canUseLinkPreviews,
    canUseTrackFlows,
    isBetaEnabled,
};
