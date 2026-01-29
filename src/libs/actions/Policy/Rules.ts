import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type OpenPolicyRulesPageParams from '@libs/API/parameters/OpenPolicyRulesPageParams';
import type SetPolicyCodingRuleParams from '@libs/API/parameters/SetPolicyCodingRuleParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as NumberUtils from '@libs/NumberUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleForm} from '@src/types/form';
import type Policy from '@src/types/onyx/Policy';
import type {CodingRule, CodingRuleTax} from '@src/types/onyx/Policy';

/**
 * Builds the tax object from a tax key and policy
 */
function buildTaxObject(taxKey: string | undefined, policy: Policy | undefined): CodingRuleTax | undefined {
    if (!taxKey || !policy?.taxRates?.taxes) {
        return undefined;
    }

    const tax = policy.taxRates.taxes[taxKey];
    if (!tax) {
        return undefined;
    }

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: {
            externalID: taxKey,
            value: tax.value,
            name: tax.name,
        },
    };
}

/**
 * Maps form fields to rule properties with null for empty values.
 * Used for Onyx to properly remove cleared fields during merge.
 */
function mapFormFieldsToRuleForOnyx(form: MerchantRuleForm, policy: Policy | undefined) {
    return {
        merchant: form.merchant || null,
        category: form.category || null,
        tag: form.tag || null,
        tax: buildTaxObject(form.tax, policy) ?? null,
        comment: form.comment || null,
        reimbursable: form.reimbursable ?? null,
        billable: form.billable ?? null,
    };
}

/**
 * Maps form fields to rule properties, omitting empty values.
 * Used for API to avoid sending null values.
 */
function mapFormFieldsToRuleForAPI(form: MerchantRuleForm, policy: Policy | undefined): Partial<CodingRule> {
    const rule: Partial<CodingRule> = {};

    if (form.merchant) {
        rule.merchant = form.merchant;
    }
    if (form.category) {
        rule.category = form.category;
    }
    if (form.tag) {
        rule.tag = form.tag;
    }
    const tax = buildTaxObject(form.tax, policy);
    if (tax) {
        rule.tax = tax;
    }
    if (form.comment) {
        rule.comment = form.comment;
    }
    if (form.reimbursable !== undefined) {
        rule.reimbursable = form.reimbursable;
    }
    if (form.billable !== undefined) {
        rule.billable = form.billable;
    }

    return rule;
}

/**
 * Fetches policy rules data when the rules page is opened.
 * @param policyID - The ID of the policy to fetch rules for
 */
function openPolicyRulesPage(policyID: string | undefined) {
    if (!policyID) {
        Log.warn('Invalid params for openPolicyRulesPage', {policyID});
        return;
    }
    const params: OpenPolicyRulesPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_RULES_PAGE, params);
}

/**
 * Creates or updates a coding rule for the given policy
 * @param policyID - The ID of the policy to create/update the rule for
 * @param form - The form data for the merchant rule
 * @param policy - The policy object (needed to build tax data)
 * @param ruleID - Optional existing rule ID for updates
 * @param shouldUpdateMatchingTransactions - Whether to update transactions that match the rule
 */
function setPolicyCodingRule(policyID: string, form: MerchantRuleForm, policy: Policy | undefined, ruleID?: string, shouldUpdateMatchingTransactions = false) {
    if (!policyID || !form.merchantToMatch) {
        Log.warn('Invalid params for setPolicyCodingRule', {policyID, merchantToMatch: form.merchantToMatch});
        return;
    }

    const isEditing = !!ruleID;
    const existingRule = isEditing ? policy?.rules?.codingRules?.[ruleID] : undefined;

    // Build rule with nulls for Onyx (to remove cleared fields) and without nulls for API
    const ruleFieldsForOnyx = mapFormFieldsToRuleForOnyx(form, policy);
    const ruleFieldsForAPI = mapFormFieldsToRuleForAPI(form, policy);

    const targetRuleID = ruleID ?? NumberUtils.rand64();
    const operator = form.matchType;
    const created = existingRule?.created ?? new Date().toISOString();

    // Rule for Onyx optimistic update (includes null values to remove cleared fields)
    const ruleForOnyx = {
        ruleID: targetRuleID,
        filters: {
            left: 'merchant',
            operator,
            right: form.merchantToMatch,
        },
        ...ruleFieldsForOnyx,
        created,
    };

    // Rule for API (excludes null values)
    const ruleForAPI: Partial<CodingRule> = {
        ruleID: targetRuleID,
        filters: {
            left: 'merchant',
            operator,
            right: form.merchantToMatch,
        },
        ...ruleFieldsForAPI,
        created,
    };

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    const pendingAction = isEditing ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

    // On failure: for new rules, remove the optimistic rule; for edits, restore the original rule
    const failureRuleValue = isEditing ? existingRule : null;

    const onyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        codingRules: {
                            [targetRuleID]: ruleForOnyx,
                        },
                    },
                    pendingFields: {
                        rules: pendingAction,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    pendingFields: {
                        rules: null,
                    },
                    errorFields: {
                        rules: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        codingRules: {
                            [targetRuleID]: failureRuleValue,
                        },
                    },
                    pendingFields: {
                        rules: null,
                    },
                    errorFields: {
                        rules: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyCodingRuleParams = {
        policyID,
        codingRuleID: targetRuleID,
        codingRuleValue: JSON.stringify(ruleForAPI),
        shouldUpdateMatchingTransactions,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CODING_RULE, parameters, onyxData);
}

/**
 * Deletes a coding rule from the given policy
 * @param policyID - The ID of the policy to delete the rule from
 * @param ruleID - The ID of the rule to delete
 */
function deletePolicyCodingRule(policy: Policy, ruleID: string) {
    if (!policy.id || !ruleID) {
        Log.warn('Invalid params for deletePolicyCodingRule');
        return;
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;
    const existingRule = policy.rules?.codingRules?.[ruleID];

    const onyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        codingRules: {
                            [ruleID]: null,
                        },
                    },
                    pendingFields: {
                        rules: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    pendingFields: {
                        rules: null,
                    },
                    errorFields: {
                        rules: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        codingRules: {
                            [ruleID]: existingRule,
                        },
                    },
                    pendingFields: {
                        rules: null,
                    },
                    errorFields: {
                        rules: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyCodingRuleParams = {
        policyID: policy.id,
        codingRuleID: ruleID,
        codingRuleValue: '',
        shouldUpdateMatchingTransactions: false,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CODING_RULE, parameters, onyxData);
}

export {openPolicyRulesPage, setPolicyCodingRule, deletePolicyCodingRule};
