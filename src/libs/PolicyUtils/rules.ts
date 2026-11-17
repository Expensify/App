/**
 * Custom categories, max expense limits, configured-rule checks, tag approver rules, and the rules document URL.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {getApiRoot} from '@libs/ApiUtils';
import {hasAnyCategoryRules} from '@libs/CategoryUtils';

import CONST from '@src/CONST';
import type {Policy, PolicyCategories} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Checks if a policy has any custom categories (categories not in the default list)
 */
function hasCustomCategories(policyCategories: OnyxEntry<PolicyCategories>): boolean {
    if (!policyCategories) {
        return false;
    }

    const defaultCategoryNames = new Set<string>(Object.values(CONST.POLICY.DEFAULT_CATEGORIES));

    return Object.values(policyCategories).some((category) => category && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !defaultCategoryNames.has(category.name));
}

/**
 * Checks whether a policy max expense amount (e.g. `maxExpenseAmountNoReceipt`) is actually configured.
 *
 * `0` is a valid limit meaning "always required", so a falsy check would wrongly treat an explicit $0.00 as unset.
 * Only `undefined` and `CONST.DISABLED_MAX_EXPENSE_VALUE` mean the amount is not set.
 */
function isMaxExpenseAmountSet(value: number | undefined): value is number {
    return value !== undefined && value !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

/**
 * Checks if a policy has any rules configured (structured rules, individual expense limits, or prohibited expenses).
 */
function hasConfiguredRules(policy: OnyxEntry<Policy>, policyCategories: PolicyCategories | null | undefined, hasExpenseDefaultRules: boolean): boolean {
    if (!policy) {
        return false;
    }

    if (hasExpenseDefaultRules) {
        return true;
    }

    if (!!policy.customRules && policy.customRules.trim().length > 0) {
        return true;
    }

    const {rules: policyRules} = policy;
    if (!!policyRules?.approvalRules && policyRules.approvalRules.length > 0) {
        return true;
    }
    if (!!policyRules?.expenseRules && policyRules.expenseRules.length > 0) {
        return true;
    }
    if (!!policy.maxExpenseAmount && policy.maxExpenseAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE && policy.maxExpenseAmount !== CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT) {
        return true;
    }
    if (!!policy.maxExpenseAge && policy.maxExpenseAge !== CONST.DISABLED_MAX_EXPENSE_VALUE && policy.maxExpenseAge !== CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE) {
        return true;
    }
    if (
        !!policy.maxExpenseAmountNoReceipt &&
        policy.maxExpenseAmountNoReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE &&
        policy.maxExpenseAmountNoReceipt !== CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT
    ) {
        return true;
    }
    if (
        !!policy.maxExpenseAmountNoItemizedReceipt &&
        policy.maxExpenseAmountNoItemizedReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE &&
        policy.maxExpenseAmountNoItemizedReceipt !== CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_ITEMIZED_RECEIPT
    ) {
        return true;
    }

    if (policy.defaultBillable) {
        return true;
    }
    if (policy.defaultReimbursable === false) {
        return true;
    }
    if (policy.eReceipts) {
        return true;
    }
    if (policy.requireCompanyCardsEnabled) {
        return true;
    }

    const {prohibitedExpenses} = policy;
    if (
        !!prohibitedExpenses &&
        Object.entries(CONST.POLICY.DEFAULT_PROHIBITED_EXPENSES).some(([key, defaultValue]) => {
            const value = prohibitedExpenses[key as keyof typeof CONST.POLICY.DEFAULT_PROHIBITED_EXPENSES];
            return value !== undefined && value !== defaultValue;
        })
    ) {
        return true;
    }

    return hasAnyCategoryRules(policyCategories ?? undefined);
}

function getTagApproverRule(policy: OnyxEntry<Policy>, tagName: string) {
    if (!policy) {
        return;
    }

    const approvalRules = policy.rules?.approvalRules ?? [];
    const approverRule = approvalRules.find((rule) =>
        rule.applyWhen.find(({condition, field, value}) => condition === CONST.POLICY.RULE_CONDITIONS.MATCHES && field === CONST.POLICY.FIELDS.TAG && value === tagName),
    );

    return approverRule;
}

/**
 * Builds a source URL for rendering a policy document PDF.
 * Local blob/file URIs (from optimistic uploads) are returned directly.
 * Remote URLs are routed through the authenticated GetPolicyRulesDocument streaming endpoint.
 * The stored URL (which contains a unique timestamp per upload) is appended as a version
 * parameter so the browser treats each replacement as a distinct resource.
 */
function getRulesDocumentSourceURL(rulesDocumentURL: string | undefined, policyID: string | undefined, encryptedAuthToken: string): string {
    if (!rulesDocumentURL || !policyID) {
        return '';
    }

    const isLocalFile = rulesDocumentURL.startsWith('blob:') || rulesDocumentURL.startsWith('file:');
    if (isLocalFile) {
        return rulesDocumentURL;
    }

    return addEncryptedAuthTokenToURL(
        // Each PDF upload gets a unique S3 key, so rulesDocumentURL changes on every replacement.
        // Encoding it as cacheBuster ensures the full streaming URL is also unique, preventing stale browser/pdfjs cache.
        `${getApiRoot({shouldUseSecure: false})}api/GetPolicyRulesDocument?policyID=${policyID}&cacheBuster=${encodeURIComponent(rulesDocumentURL)}`,
        encryptedAuthToken,
        true,
    );
}

export {hasCustomCategories, isMaxExpenseAmountSet, hasConfiguredRules, getTagApproverRule, getRulesDocumentSourceURL};
