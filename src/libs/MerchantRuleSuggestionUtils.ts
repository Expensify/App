import CONST from '@src/CONST';
import type {MerchantRuleForm} from '@src/types/form';
import type {MerchantRuleSuggestion, Policy, Transaction} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry} from 'react-native-onyx';

import Parser from './Parser';
import {resolveCurrentTaxCode} from './PolicyUtils';
import {trimTag} from './TagUtils';
import {getBillable, getCategory, getDescription, getMerchant, getReimbursable, getTag, getTagArrayFromName, getTaxCode, isMerchantMissing} from './TransactionUtils';

/** Whether a stored offer still stands: it names an expense, was not left behind, and was not dismissed this session. */
function isMerchantRuleSuggestionLive(suggestion: OnyxEntry<MerchantRuleSuggestion>): boolean {
    if (!suggestion?.transactionID || suggestion.isRetired) {
        return false;
    }
    return !suggestion.dismissedTransactionIDs?.includes(suggestion.transactionID);
}

/**
 * Which levels of a multi-level tag changed. Editing one level of `A:B:C` should seed a rule for that level alone,
 * and the update action only sees the whole joined tag, so the levels are worked out by comparing before with after.
 */
function getChangedTagLevels(previousTag: string, nextTag: string): number[] {
    const previousLevels = getTagArrayFromName(previousTag);
    const nextLevels = getTagArrayFromName(nextTag);
    const changed: number[] = [];

    for (let level = 0; level < Math.max(previousLevels.length, nextLevels.length); level++) {
        if ((previousLevels.at(level) ?? '') === (nextLevels.at(level) ?? '')) {
            continue;
        }
        changed.push(level);
    }

    return changed;
}

/** The rule draft for one edited field, in the shape the rule form expects. */
function getDraftForField(
    field: MerchantRuleSuggestionField,
    transaction: Transaction,
    policy: OnyxEntry<Policy>,
    editedTagLevels: Record<string, boolean> | undefined,
): Partial<MerchantRuleForm> {
    switch (field) {
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY: {
            const category = getCategory(transaction);
            return category ? {category} : {};
        }
        case CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG: {
            // Multi-level tags keep their colon-joined form, which the rule form expects too. Levels the user did not
            // edit are blanked, so a rule from one edited level leaves the rest for the matched expense to decide.
            // Without recorded levels, which is any single-level tag, the whole tag is carried over.
            const tag = getTag(transaction);
            if (!editedTagLevels) {
                return tag ? {tag} : {};
            }
            const editedTag = trimTag(
                getTagArrayFromName(tag)
                    .map((level, index) => (editedTagLevels[index] ? level : ''))
                    .join(':'),
            );
            return editedTag ? {tag: editedTag} : {};
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
function getMerchantRuleDraftFromTransaction(
    transaction: OnyxEntry<Transaction>,
    fields: MerchantRuleSuggestionField[],
    policy: OnyxEntry<Policy>,
    editedTagLevels?: Record<string, boolean>,
): Partial<MerchantRuleForm> | undefined {
    if (!transaction || isMerchantMissing(transaction)) {
        return undefined;
    }

    // The callout only ever creates a merchant rule, so it names the type itself. Without it the editor bounces to the
    // type chooser, which would drop the user a step back from where the callout promised to take them.
    const draft: Partial<MerchantRuleForm> = {ruleType: CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.MERCHANT, merchantToMatch: getMerchant(transaction)};

    // Each field sets a different property, so edit order does not matter.
    for (const field of fields) {
        Object.assign(draft, getDraftForField(field, transaction, policy, editedTagLevels));
    }

    return draft;
}

export {getChangedTagLevels, getMerchantRuleDraftFromTransaction, isMerchantRuleSuggestionLive};
