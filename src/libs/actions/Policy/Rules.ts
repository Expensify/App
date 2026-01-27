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
 * Converts a string boolean value ('true'/'false') to a boolean or undefined
 */
function parseStringBoolean(value: string | undefined): boolean | undefined {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return undefined;
}

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
        externalID: taxKey,
        value: tax.value,
        name: tax.name,
    };
}

/**
 * Maps form fields to rule properties
 */
function mapFormFieldsToRule(form: MerchantRuleForm, policy: Policy | undefined) {
    return {
        merchant: form.merchant || undefined,
        category: form.category || undefined,
        tag: form.tag || undefined,
        tax: buildTaxObject(form.tax, policy),
        comment: form.comment || undefined,
        reimbursable: parseStringBoolean(form.reimbursable),
        billable: parseStringBoolean(form.billable),
    };
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
 * @param updateMatchingTransactions - Whether to update transactions that match the rule
 */
function setPolicyCodingRule(policyID: string, form: MerchantRuleForm, policy: Policy | undefined, ruleID?: string, updateMatchingTransactions = false) {
    if (!policyID || !form.merchantToMatch) {
        Log.warn('Invalid params for setPolicyCodingRule', {policyID, merchantToMatch: form.merchantToMatch});
        return;
    }

    const optimisticRuleID = ruleID ?? NumberUtils.rand64();
    const ruleFields = mapFormFieldsToRule(form, policy);

    const optimisticRule: CodingRule = {
        ruleID: optimisticRuleID,
        filters: {
            left: 'merchant',
            operator: 'contains',
            right: form.merchantToMatch,
        },
        ...ruleFields,
        created: new Date().toISOString(),
    };

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    const onyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        codingRules: {
                            [optimisticRuleID]: optimisticRule,
                        },
                    },
                    pendingFields: {
                        rules: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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
                            [optimisticRuleID]: null,
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
        ruleID: optimisticRuleID,
        value: JSON.stringify(optimisticRule),
        updateMatchingTransactions,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CODING_RULE, parameters, onyxData);
}

export {openPolicyRulesPage, setPolicyCodingRule};
