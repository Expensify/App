/**
 * Workspace upgrade redirects and navigation after enabling a feature.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isCollectPolicy, isControlPolicy, isSubmitPolicy} from './policyType';

/**
 * For Submit workspaces, certain features require upgrading the plan before enabling.
 * When conditions match, navigates to the workspace upgrade flow and returns true (caller should not enable the feature).
 * @returns true if upgrade navigation was performed; false otherwise
 */
function tryNavigateToSubmitWorkspaceUpgrade(policy: OnyxEntry<Policy>, isEnabling: boolean, upgradeFeatureAlias: string, backTo?: string): boolean {
    if (!policy?.id || !isEnabling || !isSubmitPolicy(policy)) {
        return false;
    }
    // Default the upgrade page's back destination to More Features (the source of most upgrade-gated toggles).
    // Entry points outside More Features (e.g. the Roles flow) pass their own backTo so the user returns there.
    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policy?.id, upgradeFeatureAlias, backTo ?? ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policy?.id)));
    return true;
}

/**
 * Collect workspaces can access a limited subset of Rules features. When a Collect admin tries to
 * access a Control-only Rules feature, navigate to the upgrade flow and return true.
 *
 * @param shouldReplace - Replace the current screen instead of pushing the upgrade page on top of it. Use this when
 * the redirect happens from the Control-only page itself, so pressing Back doesn't land back on a page Collect
 * can't use. Press handlers on a page Collect *can* use should keep the default push.
 */
function tryNavigateToControlPolicyUpgrade(policy: OnyxEntry<Policy>, upgradeFeatureAlias: string, backTo?: string, shouldReplace = false): boolean {
    if (!policy?.id || isControlPolicy(policy) || !isCollectPolicy(policy)) {
        return false;
    }

    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policy.id, upgradeFeatureAlias, backTo ?? ROUTES.WORKSPACE_RULES.getRoute(policy.id)), {forceReplace: shouldReplace});
    return true;
}

function goBackFromInvalidPolicy() {
    Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
}

function goBackWhenEnableFeature() {
    setTimeout(() => {
        Navigation.goBack();
    }, CONST.WORKSPACE_ENABLE_FEATURE_REDIRECT_DELAY);
}

function navigateToExpensifyCardPage(policyID: string) {
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
    });
}

export {tryNavigateToSubmitWorkspaceUpgrade, tryNavigateToControlPolicyUpgrade, goBackFromInvalidPolicy, goBackWhenEnableFeature, navigateToExpensifyCardPage};
