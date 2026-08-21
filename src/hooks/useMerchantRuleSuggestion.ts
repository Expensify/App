import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {arePolicyRulesEnabled, isPolicyAdmin} from '@libs/PolicyUtils';
import {isMerchantMissing} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, Transaction} from '@src/types/onyx';

import {useMemo} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePolicyFeatureWriteAccess from './usePolicyFeatureWriteAccess';

type MerchantRuleSuggestionResult = {
    /** The edit that can be turned into a merchant rule, or undefined when no callout should render */
    suggestion: MerchantRuleSuggestion | undefined;

    /** The edited expense, needed to pre-seed the rule */
    transaction: Transaction | undefined;

    /** The workspace that would own the rule */
    policy: Policy | undefined;
};

/**
 * Resolves the "Create a rule" callout for an expense detail view: an admin just edited a field that merchant rules
 * can govern, and hasn't dismissed the prompt for that expense.
 *
 * @param reportID - the report hosting the expense detail view (a transaction thread or its parent expense report)
 * @param policyID - the workspace the expense belongs to
 */
function useMerchantRuleSuggestion(reportID: string | undefined, policyID: string | undefined): MerchantRuleSuggestionResult {
    const {isBetaEnabled} = usePermissions();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    // The collection is RAM-only and holds at most one entry per expense edited this session, so subscribing to all of
    // it is cheaper than resolving this report's transaction on every report render.
    const [suggestions] = useOnyx(ONYXKEYS.COLLECTION.RAM_ONLY_MERCHANT_RULE_SUGGESTION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);

    // Only workspace admins can create merchant rules, so nobody else should be prompted to
    const canCreateMerchantRule =
        !!reportID && isPolicyAdmin(policy, currentUserLogin) && canWriteRules && arePolicyRulesEnabled(policy, policyCategories, isBetaEnabled(CONST.BETAS.RULES_REVAMP));

    const suggestion = useMemo(() => {
        if (!canCreateMerchantRule) {
            return undefined;
        }
        return Object.values(suggestions ?? {}).find((entry) => !!entry && !entry.isDismissed && entry.reportIDs.includes(reportID));
    }, [canCreateMerchantRule, reportID, suggestions]);

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(suggestion?.transactionID)}`);

    // A merchant rule matches on merchant, so an expense without one (e.g. a receipt still scanning) can't seed a rule
    if (!suggestion || !transaction || isMerchantMissing(transaction)) {
        return {suggestion: undefined, transaction: undefined, policy: undefined};
    }

    return {suggestion, transaction, policy};
}

export default useMerchantRuleSuggestion;
