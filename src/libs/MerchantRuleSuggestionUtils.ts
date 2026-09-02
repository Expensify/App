import CONST from '@src/CONST';
import type {MerchantRuleForm} from '@src/types/form';
import type {MerchantRuleSuggestion, Policy, Transaction} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry} from 'react-native-onyx';

import Parser from './Parser';
import {resolveCurrentTaxCode} from './PolicyUtils';
import {getBillable, getCategory, getDescription, getMerchant, getReimbursable, getTag, getTaxCode, isMerchantMissing} from './TransactionUtils';

/**
 * Whether a stored offer is still live: it names an expense, has not been left behind, and that expense has not been
 * dismissed this session. Both the callout's cheap outer gate and `useMerchantRuleSuggestion` ask this, so the answer
 * is defined once here rather than spelled out in each.
 */
function isMerchantRuleSuggestionLive(suggestion: OnyxEntry<MerchantRuleSuggestion>): boolean {
    if (!suggestion?.transactionID || suggestion.isRetired) {
        return false;
    }
    return !suggestion.dismissedTransactionIDs?.includes(suggestion.transactionID);
}

/** The rule draft for one edited field, in the shape the rule form expects. */
function getDraftForField(field: MerchantRuleSuggestionField, transaction: Transaction, policy: OnyxEntry<Policy>): Partial<MerchantRuleForm> {
    switch (field) {
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY: {
            const category = getCategory(transaction);
            return category ? {category} : {};
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG: {
            // Multi-level tags stay in the transaction's colon-joined form, which is what the rule form expects too
            const tag = getTag(transaction);
            return tag ? {tag} : {};
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAX: {
            // The rule form stores the key of the tax in `policy.taxRates.taxes`, which is what a transaction stores
            // as its taxCode. A transaction can still carry a code that has since been renamed, so resolve it first.
            const storedTaxCode = getTaxCode(transaction);
            const taxCode = storedTaxCode ? resolveCurrentTaxCode(policy, storedTaxCode) : undefined;
            return taxCode && policy?.taxRates?.taxes?.[taxCode] ? {tax: taxCode} : {};
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.DESCRIPTION: {
            // An expense description is stored as HTML, while the rule form edits markdown
            const description = getDescription(transaction);
            return description ? {comment: Parser.htmlToMarkdown(description)} : {};
        }
        // Read through the helpers rather than the raw fields, so an unset value seeds the rule with what the expense
        // view actually displays. An unset `reimbursable` shows as reimbursable, and would otherwise seed "Don't change".
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.BILLABLE:
            return {billable: getBillable(transaction)};
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.REIMBURSABLE:
            return {reimbursable: getReimbursable(transaction)};
        default:
            return {};
    }
}

/**
 * Builds the draft that pre-seeds the rule creation flow when an admin turns their expense edits into a rule. Every
 * field they changed since they started editing is carried over, so a rule created after changing category, tag and
 * tax arrives with all three filled in. Returns undefined when the expense has no merchant to match on, since a rule
 * cannot be saved without one.
 */
function getMerchantRuleDraftFromTransaction(transaction: OnyxEntry<Transaction>, fields: MerchantRuleSuggestionField[], policy: OnyxEntry<Policy>): Partial<MerchantRuleForm> | undefined {
    if (!transaction || isMerchantMissing(transaction)) {
        return undefined;
    }

    const draft: Partial<MerchantRuleForm> = {merchantToMatch: getMerchant(transaction)};

    // Each field contributes a different property, so the order they were edited in does not matter.
    for (const field of fields) {
        Object.assign(draft, getDraftForField(field, transaction, policy));
    }

    return draft;
}

export {getMerchantRuleDraftFromTransaction, isMerchantRuleSuggestionLive};
