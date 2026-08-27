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
import useReportTransactions from './useReportTransactions';

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
 * @param reportID - the report hosting the expense detail view (a transaction thread, its expense report, or the chat the expense lives in)
 * @param policyID - the workspace the expense belongs to
 * @param transactionID - the expense being displayed, when the caller already knows it
 */
function useMerchantRuleSuggestion(reportID: string | undefined, policyID: string | undefined, transactionID?: string): MerchantRuleSuggestionResult {
    const {isBetaEnabled} = usePermissions();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const [storedSuggestion] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(storedSuggestion?.transactionID)}`);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);

    // A screen hosts this expense when it renders the expense itself (the caller passes the transaction), when it is
    // the expense's own transaction thread, or when it is a report listing the expense. Asking the report which
    // transactions it holds is authoritative, unlike the reports that happened to be in scope during the edit.
    const reportTransactions = useReportTransactions(reportID);
    const isHostingReport =
        !!reportID && (reportID === storedSuggestion?.reportIDs.at(0) || reportTransactions.some((reportTransaction) => reportTransaction.transactionID === storedSuggestion?.transactionID));
    const isForThisExpenseView = !!storedSuggestion && !storedSuggestion.isDismissed && ((!!transactionID && transactionID === storedSuggestion.transactionID) || isHostingReport);
    // Only workspace admins can create merchant rules, so nobody else should be offered one
    const canCreateMerchantRule = isPolicyAdmin(policy, currentUserLogin) && canWriteRules && arePolicyRulesEnabled(policy, policyCategories, isBetaEnabled(CONST.BETAS.RULES_REVAMP));
    const suggestion = isForThisExpenseView && canCreateMerchantRule ? storedSuggestion : undefined;

    // A merchant rule matches on merchant, so an expense without one (e.g. a receipt still scanning) can't seed a rule
    if (!suggestion || !transaction || isMerchantMissing(transaction)) {
        return {suggestion: undefined, transaction: undefined, policy: undefined};
    }

    return {suggestion, transaction, policy};
}

export default useMerchantRuleSuggestion;
