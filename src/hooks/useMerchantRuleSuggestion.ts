import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isMerchantRuleSuggestionLive} from '@libs/MerchantRuleSuggestionUtils';
import {arePolicyRulesEnabled} from '@libs/PolicyUtils';
import {isMerchantMissing} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, Transaction} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePolicyFeatureWriteAccess from './usePolicyFeatureWriteAccess';
import useReportTransactions from './useReportTransactions';

type MerchantRuleSuggestionResult = {
    /** The edits that can be turned into a merchant rule, or undefined when no callout should render */
    suggestion: MerchantRuleSuggestion | undefined;

    /** Every field edited on that expense so far, which the rule is pre-seeded from */
    fields: MerchantRuleSuggestionField[];

    /** Which levels of a multi-level tag were edited, so untouched levels stay out of the rule */
    editedTagLevels: Record<string, boolean> | undefined;

    /** The edited expense, needed to pre-seed the rule */
    transaction: Transaction | undefined;

    /** The workspace that would own the rule */
    policy: Policy | undefined;
};

/**
 * Resolves the "Create a rule" callout: someone who can write workspace rules just edited a field a merchant rule can
 * govern, and hasn't dismissed the offer for that expense.
 *
 * @param reportID - the report showing the expense: its transaction thread, or a report holding only that expense
 */
function useMerchantRuleSuggestion(reportID: string | undefined, policyID: string | undefined): MerchantRuleSuggestionResult {
    const {isBetaEnabled} = usePermissions();

    const [storedSuggestion] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(storedSuggestion?.transactionID)}`);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);

    // The callout belongs on a screen showing the expense itself: its transaction thread, or a report holding only
    // that expense. A report listing several shows no expense detail. Asking the report what it holds beats trusting
    // whichever report was in scope during the edit.
    const reportTransactions = useReportTransactions(reportID);
    const isOneExpenseReportForSuggestion = reportTransactions.length === 1 && reportTransactions.at(0)?.transactionID === storedSuggestion?.transactionID;
    const isHostingReport = !!reportID && (reportID === storedSuggestion?.reportID || isOneExpenseReportForSuggestion);
    const isForThisExpenseView = isMerchantRuleSuggestionLive(storedSuggestion) && isHostingReport;
    // Offer it to exactly who the rule page lets in: write access to Rules. Admins today, and editors, who can
    // already create the same rule from workspace settings.
    const canCreateMerchantRule = canWriteRules && arePolicyRulesEnabled(policy, policyCategories, isBetaEnabled(CONST.BETAS.RULES_REVAMP));
    const suggestion = isForThisExpenseView && canCreateMerchantRule ? storedSuggestion : undefined;

    // Filtered from the canonical list, not the record's own keys, so the order is fixed and only known fields reach
    // the draft.
    const editedFields = suggestion ? suggestion.editedFields?.[suggestion.transactionID] : undefined;
    const fields = Object.values(CONST.MERCHANT_RULE_SUGGESTION_FIELDS).filter((field) => !!editedFields?.[field]);

    // A rule matches on merchant, so an expense without one (a receipt still scanning) can't seed one. Nor can an
    // offer with nothing recorded, which is how an expense reads once its fields are cleared.
    if (!suggestion || !transaction || isMerchantMissing(transaction) || fields.length === 0) {
        return {suggestion: undefined, fields: [], editedTagLevels: undefined, transaction: undefined, policy: undefined};
    }

    return {suggestion, fields, editedTagLevels: suggestion.editedTagLevels?.[suggestion.transactionID], transaction, policy};
}

export default useMerchantRuleSuggestion;
