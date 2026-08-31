import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';
import type BetaConfiguration from '@src/types/onyx/BetaConfiguration';
import type BetaOverrides from '@src/types/onyx/BetaOverrides';

import type {OnyxEntry} from 'react-native-onyx';

import getEnvironment from './Environment/getEnvironment';

// Start from the synchronous config so overrides never apply in production, then refine with the resolved
// environment, which downgrades TestFlight builds to staging
let isProductionEnvironment = CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.PRODUCTION;
getEnvironment().then((environment) => {
    isProductionEnvironment = environment === CONST.ENVIRONMENT.PRODUCTION;
});

// eslint-disable-next-line rulesdir/no-beta-handler
function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews(): boolean {
    return false;
}

function isBetaEnabled(beta: Beta, betas: OnyxEntry<Beta[]>, betaConfiguration?: OnyxEntry<BetaConfiguration>, betaOverrides?: OnyxEntry<BetaOverrides>): boolean {
    if (!isProductionEnvironment) {
        const override = betaOverrides?.[beta];
        if (override !== undefined) {
            return override;
        }
    }

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
 * Track flows ("Share with my accountant", "Categorize it") are hardcoded off.
 * TODO: Remove this gate and its call sites once the new track flows feature is complete.
 * See: https://github.com/Expensify/Expensify/issues/504214
 */
function canUseTrackFlows(): boolean {
    return false;
}

/**
 * Private notes are temporarily disabled.
 */
function canUsePrivateNotes(): boolean {
    return false;
}

export default {
    canUseLinkPreviews,
    canUseTrackFlows,
    canUsePrivateNotes,
    isBetaEnabled,
};
