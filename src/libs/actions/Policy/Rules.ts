import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type OpenPolicyRulesPageParams from '@libs/API/parameters/OpenPolicyRulesPageParams';
import type SetPolicyMerchantRuleParams from '@libs/API/parameters/SetPolicyMerchantRuleParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {OnyxData} from '@src/Onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleForm} from '@src/types/form';
import type {CodingRule} from '@src/types/onyx/Policy';

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
 */
function setPolicyMerchantRule(policyID: string, form: MerchantRuleForm) {
    if (!policyID || !form.merchantToMatch) {
        Log.warn('Invalid params for setPolicyMerchantRule', {policyID, merchantToMatch: form.merchantToMatch});
        return;
    }

    // Generate a temporary rule ID for optimistic update
    const tempRuleID = `temp_${Date.now()}`;

    // Create the optimistic coding rule
    const optimisticRule: CodingRule = {
        filters: {
            left: 'merchant',
            operator: 'contains',
            right: form.merchantToMatch,
        },
        merchant: form.merchant || undefined,
        category: form.category || undefined,
        tag: form.tag || undefined,
        comment: form.comment || undefined,
        reimbursable: form.reimbursable === 'true' ? true : form.reimbursable === 'false' ? false : undefined,
        billable: form.billable === 'true' ? true : form.billable === 'false' ? false : undefined,
        created: new Date().toISOString(),
    };

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        codingRules: {
                            [tempRuleID]: optimisticRule,
                        },
                    },
                    pendingFields: {
                        codingRules: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        codingRules: null,
                    },
                    errorFields: {
                        codingRules: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        codingRules: {
                            [tempRuleID]: null,
                        },
                    },
                    pendingFields: {
                        codingRules: null,
                    },
                    errorFields: {
                        codingRules: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyMerchantRuleParams = {
        policyID,
        merchantToMatch: form.merchantToMatch,
        merchant: form.merchant || undefined,
        category: form.category || undefined,
        tag: form.tag || undefined,
        tax: form.tax || undefined,
        comment: form.comment || undefined,
        reimbursable: form.reimbursable === 'true' ? true : form.reimbursable === 'false' ? false : undefined,
        billable: form.billable === 'true' ? true : form.billable === 'false' ? false : undefined,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_MERCHANT_RULE, parameters, onyxData);
}

export {openPolicyRulesPage, setPolicyMerchantRule};
