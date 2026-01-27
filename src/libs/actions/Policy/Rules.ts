import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type OpenPolicyRulesPageParams from '@libs/API/parameters/OpenPolicyRulesPageParams';
import type SetPolicyMerchantRuleParams from '@libs/API/parameters/SetPolicyMerchantRuleParams';
import type {PolicyRuleTaxRate} from '@libs/API/parameters/SetPolicyMerchantRuleParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as NumberUtils from '@libs/NumberUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleForm} from '@src/types/form';
import type Policy from '@src/types/onyx/Policy';
import type {CodingRuleTax} from '@src/types/onyx/Policy';

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
 * Builds the PolicyRuleTaxRate object for API requests
 */
function buildApiTaxObject(taxKey: string | undefined, policy: Policy | undefined): PolicyRuleTaxRate | undefined {
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
 * Builds the CodingRuleTax object for Onyx optimistic data
 */
function buildOnyxTaxObject(taxKey: string | undefined, policy: Policy | undefined): CodingRuleTax | undefined {
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
        },
    };
}

/**
 * Maps form fields to rule properties for Onyx optimistic data
 */
function mapFormFieldsForOnyx(form: MerchantRuleForm, policy: Policy | undefined) {
    return {
        merchant: form.merchant || undefined,
        category: form.category || undefined,
        tag: form.tag || undefined,
        tax: buildOnyxTaxObject(form.tax, policy),
        comment: form.comment || undefined,
        reimbursable: parseStringBoolean(form.reimbursable),
        billable: parseStringBoolean(form.billable),
    };
}

/**
 * Maps form fields to rule properties for API request
 */
function mapFormFieldsForApi(form: MerchantRuleForm, policy: Policy | undefined) {
    return {
        merchant: form.merchant || undefined,
        category: form.category || undefined,
        tag: form.tag || undefined,
        tax: buildApiTaxObject(form.tax, policy),
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
 * Creates a new merchant rule for the given policy
 * @param policyID - The ID of the policy to create the rule for
 * @param form - The form data for the merchant rule
 * @param policy - The policy object (needed to build tax data)
 */
function setPolicyMerchantRule(policyID: string, form: MerchantRuleForm, policy: Policy | undefined) {
    if (!policyID || !form.merchantToMatch) {
        Log.warn('Invalid params for setPolicyMerchantRule', {policyID, merchantToMatch: form.merchantToMatch});
        return;
    }

    const optimisticRuleID = NumberUtils.rand64();
    const onyxFields = mapFormFieldsForOnyx(form, policy);

    const optimisticRule = {
        filters: {
            left: 'merchant',
            operator: 'eq',
            right: form.merchantToMatch,
        },
        ...onyxFields,
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

    const apiFields = mapFormFieldsForApi(form, policy);
    const parameters: SetPolicyMerchantRuleParams = {
        policyID,
        merchantToMatch: form.merchantToMatch,
        ...apiFields,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_MERCHANT_RULE, parameters, onyxData);
}

export {openPolicyRulesPage, setPolicyMerchantRule};
