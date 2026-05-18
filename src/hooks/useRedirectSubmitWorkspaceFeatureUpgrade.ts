import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {canAccessSubmitWorkspaceFeatures} from '@libs/PolicyUtils';
import ROUTES from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type UseRedirectSubmitWorkspaceFeatureUpgradeParams = {
    policy: OnyxEntry<Policy> | undefined;
    policyID: string | undefined;
    /** Route passed to `ROUTES.WORKSPACE_UPGRADE.getRoute` as `backTo`. */
    backTo: string | undefined;
    /** `CONST.UPGRADE_FEATURE_INTRO_MAPPING.*.alias` for the feature being gated. */
    upgradeFeatureAlias: string;
    isSubmit2026BetaEnabled: boolean;
    /** When true, the redirect is skipped (e.g. while required Onyx data is still loading). */
    shouldDeferRedirect?: boolean;
};

/**
 * For users on a Submit workspace with SUBMIT_2026 beta, redirects once to the workspace upgrade flow
 * when opening a feature that requires upgrading. Matches the pattern used on role-selection RHP screens.
 */
function useRedirectSubmitWorkspaceFeatureUpgrade({
    policy,
    policyID,
    backTo,
    upgradeFeatureAlias,
    isSubmit2026BetaEnabled,
    shouldDeferRedirect = false,
}: UseRedirectSubmitWorkspaceFeatureUpgradeParams): void {
    const didRedirectRef = useRef(false);

    useEffect(() => {
        if (didRedirectRef.current || !policyID || !backTo || isEmptyObject(policy) || shouldDeferRedirect || !canAccessSubmitWorkspaceFeatures(policy, isSubmit2026BetaEnabled)) {
            return;
        }
        didRedirectRef.current = true;
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, upgradeFeatureAlias, backTo));
    }, [policy, policyID, backTo, upgradeFeatureAlias, isSubmit2026BetaEnabled, shouldDeferRedirect]);
}

export default useRedirectSubmitWorkspaceFeatureUpgrade;
