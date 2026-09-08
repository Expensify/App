import {arePolicyRulesEnabled, isCollectPolicy, tryNavigateToControlPolicyUpgrade} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

import {useEffect, useRef} from 'react';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';

/**
 * Sends a Collect admin who lands on a Control-only Rules page to the Control upgrade page.
 *
 * The Rules page gates its own Control-only features on press, but these pages are also reachable in ways that
 * skip it: direct deep links to the page and its child pickers, and Wallet > Expensify card > Edit spend rules.
 * An `accessVariants` CONTROL check can't be used for that, because AccessOrNotFoundWrapper only ever renders
 * Not Found, never an upgrade path.
 *
 * @param policyID - The policy the page belongs to.
 * @param backTo - Where the upgrade page should return to. Defaults to the workspace Rules page.
 */
function useControlOnlyRuleUpgradeRedirect(policyID: string, backTo?: Route) {
    const policy = usePolicy(policyID);
    const {isBetaEnabled} = usePermissions();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const isCollect = isCollectPolicy(policy);
    // Mirrors the feature check in AccessOrNotFoundWrapper. When Rules itself is disabled, that wrapper already
    // redirects to More features, so redirecting to the upgrade page too would flash it on the way there.
    const isRulesFeatureEnabled = arePolicyRulesEnabled(policy, policyCategories, isBetaEnabled(CONST.BETAS.RULES_REVAMP));
    const hasRedirectedToUpgrade = useRef(false);
    const upgradeBackTo = backTo ?? ROUTES.WORKSPACE_RULES.getRoute(policyID);

    useEffect(() => {
        if (!isCollect || !isRulesFeatureEnabled || hasRedirectedToUpgrade.current) {
            return;
        }

        // Replace rather than push: Back from the upgrade page must not land on a page Collect can't use.
        hasRedirectedToUpgrade.current = tryNavigateToControlPolicyUpgrade(policy, CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias, upgradeBackTo, true);
    }, [isCollect, isRulesFeatureEnabled, policy, upgradeBackTo]);
}

export default useControlOnlyRuleUpgradeRedirect;
