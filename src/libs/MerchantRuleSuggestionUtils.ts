import CONST from '@src/CONST';
import type {MerchantRuleForm} from '@src/types/form';
import type {MerchantRuleSuggestion, Policy, Transaction} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry} from 'react-native-onyx';

import Parser from './Parser';
import {resolveCurrentTaxCode} from './PolicyUtils';
import {getBillable, getCategory, getDescription, getMerchant, getReimbursable, getTag, getTaxCode, isMerchantMissing} from './TransactionUtils';

/** Whether a stored offer still stands: it names an expense, was not left behind, and was not dismissed this session. */
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
            // Multi-level tags keep their colon-joined form, which the rule form expects too
            const tag = getTag(transaction);
            return tag ? {tag} : {};
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAX: {
            // A transaction stores the same tax key the rule form uses, but it may have been renamed since.
            const storedTaxCode = getTaxCode(transaction);
            const taxCode = storedTaxCode ? resolveCurrentTaxCode(policy, storedTaxCode) : undefined;
            return taxCode && policy?.taxRates?.taxes?.[taxCode] ? {tax: taxCode} : {};
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.DESCRIPTION: {
            // An expense description is stored as HTML, while the rule form edits markdown
            const description = getDescription(transaction);
            return description ? {comment: Parser.htmlToMarkdown(description)} : {};
        }
        // Use the helpers so an unset value seeds what the expense view shows. Unset `reimbursable` displays as
        // reimbursable, but the raw field would seed "Don't change".
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.BILLABLE:
            return {billable: getBillable(transaction)};
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.REIMBURSABLE:
            return {reimbursable: getReimbursable(transaction)};
        default:
            return {};
    }
}

/**
 * Builds the draft that pre-seeds the rule flow, carrying every field edited so far. Returns undefined when the
 * expense has no merchant, since a rule cannot match without one.
 */
function getMerchantRuleDraftFromTransaction(transaction: OnyxEntry<Transaction>, fields: MerchantRuleSuggestionField[], policy: OnyxEntry<Policy>): Partial<MerchantRuleForm> | undefined {
    if (!transaction || isMerchantMissing(transaction)) {
        return undefined;
    }

    const draft: Partial<MerchantRuleForm> = {merchantToMatch: getMerchant(transaction)};

    // Each field sets a different property, so edit order does not matter.
    for (const field of fields) {
        Object.assign(draft, getDraftForField(field, transaction, policy));
    }

    return draft;
}

export {getMerchantRuleDraftFromTransaction, isMerchantRuleSuggestionLive};
