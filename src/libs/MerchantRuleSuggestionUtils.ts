import CONST from '@src/CONST';
import type {MerchantRuleForm} from '@src/types/form';
import type {Policy, Transaction} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry} from 'react-native-onyx';

import Parser from './Parser';
import {resolveCurrentTaxCode} from './PolicyUtils';
import {getCategory, getDescription, getMerchant, getTag, isMerchantMissing} from './TransactionUtils';

/**
 * Builds the draft that pre-seeds the rule creation flow when an admin turns an expense edit into a rule. Returns
 * undefined when the expense has no merchant to match on, since a rule cannot be saved without one.
 */
function getMerchantRuleDraftFromTransaction(transaction: OnyxEntry<Transaction>, field: MerchantRuleSuggestionField, policy: OnyxEntry<Policy>): Partial<MerchantRuleForm> | undefined {
    if (!transaction || isMerchantMissing(transaction)) {
        return undefined;
    }

    const draft: Partial<MerchantRuleForm> = {merchantToMatch: getMerchant(transaction)};

    switch (field) {
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY: {
            const category = getCategory(transaction);
            if (category) {
                draft.category = category;
            }
            break;
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG: {
            // Multi-level tags stay in the transaction's colon-joined form, which is what the rule form expects too
            const tag = getTag(transaction);
            if (tag) {
                draft.tag = tag;
            }
            break;
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAX: {
            // The rule form stores the key of the tax in `policy.taxRates.taxes`, which is what a transaction stores
            // as its taxCode. A transaction can still carry a code that has since been renamed, so resolve it first.
            const taxCode = transaction.taxCode ? resolveCurrentTaxCode(policy, transaction.taxCode) : undefined;
            if (taxCode && policy?.taxRates?.taxes?.[taxCode]) {
                draft.tax = taxCode;
            }
            break;
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.DESCRIPTION: {
            // An expense description is stored as HTML, while the rule form edits markdown
            const description = getDescription(transaction);
            if (description) {
                draft.comment = Parser.htmlToMarkdown(description);
            }
            break;
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.BILLABLE:
            if (transaction.billable !== undefined) {
                draft.billable = transaction.billable;
            }
            break;
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.REIMBURSABLE:
            if (transaction.reimbursable !== undefined) {
                draft.reimbursable = transaction.reimbursable;
            }
            break;
        default:
            break;
    }

    return draft;
}

export {
    // eslint-disable-next-line import/prefer-default-export -- Utils modules export their helpers by name
    getMerchantRuleDraftFromTransaction,
};
