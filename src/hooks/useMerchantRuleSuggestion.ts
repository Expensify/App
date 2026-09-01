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
    /** The edit that can be turned into a merchant rule, or undefined when no callout should render */
    suggestion: MerchantRuleSuggestion | undefined;

    /** The edited expense, needed to pre-seed the rule */
    transaction: Transaction | undefined;

    /** The workspace that would own the rule */
    policy: Policy | undefined;
};

/**
 * Resolves the "Create a rule" callout for an expense detail view: an admin just edited a field that merchant rules
 * can govern, and hasn't dismissed the offer for that expense.
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

    // The callout belongs on the expense detail view, so a screen hosts it when it renders the expense itself (the
    // caller passes the transaction), when it is the expense's own transaction thread, or when it is a report holding
    // only that expense — which renders the expense detail view rather than a list. A report listing several expenses
    // shows no expense detail, so it is not a host. Asking the report which transactions it holds is authoritative,
    // unlike the reports that happened to be in scope during the edit.
    const reportTransactions = useReportTransactions(reportID);
    const isOneExpenseReportForSuggestion = reportTransactions.length === 1 && reportTransactions.at(0)?.transactionID === storedSuggestion?.transactionID;
    const isHostingReport = !!reportID && (reportID === storedSuggestion?.reportIDs.at(0) || isOneExpenseReportForSuggestion);
    const isDismissed = !!storedSuggestion?.transactionID && !!storedSuggestion.dismissedTransactionIDs?.includes(storedSuggestion.transactionID);
    const isForThisExpenseView = !!storedSuggestion && !isDismissed && ((!!transactionID && transactionID === storedSuggestion.transactionID) || isHostingReport);
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
