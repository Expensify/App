import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

/**
 * Submit workspaces must upgrade before enabling certain paid features.
 * @returns true when upgrade navigation was shown (caller should not run enable).
 */
function maybeNavigateSubmitPolicyFeatureUpgradeOnEnable(policy: OnyxEntry<Policy>, policyID: string | undefined, isEnabling: boolean, upgradeFeatureAlias: string): boolean {
    if (!policyID || !isEnabling || !isSubmitPolicy(policy)) {
        return false;
    }
    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, upgradeFeatureAlias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)));
    return true;
}

export {maybeNavigateSubmitPolicyFeatureUpgradeOnEnable};
