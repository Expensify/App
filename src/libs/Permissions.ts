import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Beta from '@src/types/onyx/Beta';
import type BetaConfiguration from '@src/types/onyx/BetaConfiguration';
import type BetasOverride from '@src/types/onyx/BetasOverride';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getEnvironment from './Environment/getEnvironment';

// Module-level so the non-render callers of isBetaEnabled (actions, utils, guards) respect overrides without subscribing to this key.
// Components get reactivity through usePermissions, which passes the overrides in.
let betasOverride: OnyxEntry<BetasOverride>;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS_OVERRIDE,
    callback: (value) => {
        betasOverride = value;
    },
});

// Overrides must never apply in production, so start from the synchronous config and refine with the resolved
// environment, which downgrades TestFlight builds to staging.
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

function isBetaEnabled(beta: Beta, betas: OnyxEntry<Beta[]>, betaConfiguration?: OnyxEntry<BetaConfiguration>, betasOverrideParam: OnyxEntry<BetasOverride> = betasOverride): boolean {
    if (!isProductionEnvironment) {
        const override = betasOverrideParam?.[beta];
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
