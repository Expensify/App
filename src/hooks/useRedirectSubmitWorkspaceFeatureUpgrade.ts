import Navigation from '@libs/Navigation/Navigation';
import {isSubmitPolicy} from '@libs/PolicyUtils';

import ROUTES from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef} from 'react';

type UseRedirectSubmitWorkspaceFeatureUpgradeParams = {
    policy: OnyxEntry<Policy> | undefined;
    /** Route passed to `ROUTES.WORKSPACE_UPGRADE.getRoute` as `backTo`. */
    backTo: string | undefined;
    /** `CONST.UPGRADE_FEATURE_INTRO_MAPPING.*.alias` for the feature being gated. */
    upgradeFeatureAlias: string;
};

/**
 * For users on a Submit workspace, redirects once to the workspace upgrade flow
 * when opening a feature that requires upgrading. Matches the pattern used on role-selection RHP screens.
 */
function useRedirectSubmitWorkspaceFeatureUpgrade({policy, backTo, upgradeFeatureAlias}: UseRedirectSubmitWorkspaceFeatureUpgradeParams): void {
    const didRedirectRef = useRef(false);

    useEffect(() => {
        if (didRedirectRef.current || !backTo || isEmptyObject(policy) || !isSubmitPolicy(policy)) {
            return;
        }
        didRedirectRef.current = true;
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policy?.id, upgradeFeatureAlias, backTo));
    }, [policy, backTo, upgradeFeatureAlias]);
}

export default useRedirectSubmitWorkspaceFeatureUpgrade;
