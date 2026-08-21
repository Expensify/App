import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {arePolicyRulesEnabled, isPolicyAdmin} from '@libs/PolicyUtils';
import {isMerchantMissing} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, Transaction} from '@src/types/onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePolicyFeatureWriteAccess from './usePolicyFeatureWriteAccess';

type MerchantRuleSuggestionResult = {
    /** The edit that can be turned into a merchant rule, or undefined when no tooltip should render */
    suggestion: MerchantRuleSuggestion | undefined;

    /** The edited expense, needed to pre-seed the rule */
    transaction: Transaction | undefined;

    /** The workspace that would own the rule */
    policy: Policy | undefined;
};

/**
 * Resolves the "Create a rule" tooltip for an expense detail view: an admin just edited a field that merchant rules
 * can govern, and hasn't dismissed the offer for that expense.
 *
 * Admin rights are also checked by the tooltip's own `shouldShow` in TOOLTIPS.ts, but that check is workspace-agnostic
 * (it asks whether the user administers any workspace), so the policy-specific checks live here.
 *
 * @param reportID - the report hosting the expense detail view (a transaction thread or its parent expense report)
 * @param policyID - the workspace the expense belongs to
 */
function useMerchantRuleSuggestion(reportID: string | undefined, policyID: string | undefined): MerchantRuleSuggestionResult {
    const {isBetaEnabled} = usePermissions();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const [storedSuggestion] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);

    const isForThisExpenseView = !!reportID && !!storedSuggestion && !storedSuggestion.isDismissed && storedSuggestion.reportIDs.includes(reportID);
    // Only workspace admins can create merchant rules, so nobody else should be offered one
    const canCreateMerchantRule = isPolicyAdmin(policy, currentUserLogin) && canWriteRules && arePolicyRulesEnabled(policy, policyCategories, isBetaEnabled(CONST.BETAS.RULES_REVAMP));
    const suggestion = isForThisExpenseView && canCreateMerchantRule ? storedSuggestion : undefined;

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(suggestion?.transactionID)}`);

    // A merchant rule matches on merchant, so an expense without one (e.g. a receipt still scanning) can't seed a rule
    if (!suggestion || !transaction || isMerchantMissing(transaction)) {
        return {suggestion: undefined, transaction: undefined, policy: undefined};
    }

    return {suggestion, transaction, policy};
}

export default useMerchantRuleSuggestion;
