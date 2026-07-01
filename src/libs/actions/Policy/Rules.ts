import {getImportFailedFinalModal} from '@libs/actions/ImportSpreadsheet';
import * as API from '@libs/API';
import type {AddPolicyAgentRuleParams, DeletePolicyAgentRuleParams, ImportMerchantRulesSpreadsheetParams, UpdatePolicyAgentRuleParams} from '@libs/API/parameters';
import type OpenPolicyRulesPageParams from '@libs/API/parameters/OpenPolicyRulesPageParams';
import type SetPolicyCodingRuleParams from '@libs/API/parameters/SetPolicyCodingRuleParams';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as NumberUtils from '@libs/NumberUtils';
import Parser from '@libs/Parser';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleForm} from '@src/types/form';
import type {ImportFinalModal} from '@src/types/onyx/ImportedSpreadsheet';
import type Policy from '@src/types/onyx/Policy';
import type {AgentRule, CodingRule, CodingRuleFilter, CodingRuleTax} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** A coding rule parsed from an imported spreadsheet row, keyed by a client-generated ruleID */
type ImportedMerchantRule = Omit<CodingRule, 'ruleID' | 'pendingAction' | 'errors'>;

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
 * Converts a markdown comment to HTML using Parser.replace().
 * Returns null if the comment is empty or undefined.
 */
function convertCommentToHTML(comment: string | undefined): string | null {
    if (!comment) {
        return null;
    }
    return Parser.replace(comment);
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
        comment: convertCommentToHTML(form.comment),
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
    const commentHTML = convertCommentToHTML(form.comment);
    if (commentHTML) {
        rule.comment = commentHTML;
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
    const operator = form.matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;
    const created = existingRule?.created ?? new Date().toISOString();

    const pendingAction = isEditing ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    const ruleForOnyx = {
        ruleID: targetRuleID,
        filters: {
            left: 'merchant',
            operator,
            right: form.merchantToMatch,
        },
        ...ruleFieldsForOnyx,
        created,
        pendingAction,
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
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        codingRules: {
                            [targetRuleID]: {
                                pendingAction: null,
                                errors: null,
                            },
                        },
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
                            [targetRuleID]: {
                                ...failureRuleValue,
                                pendingAction: isEditing ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
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
 * Imports coding rules parsed from a spreadsheet into the given policy in bulk
 * @param policyID - The ID of the policy to import the rules into
 * @param rules - Coding rule values keyed by client-generated ruleID
 */
async function importMerchantRulesSpreadsheet(policyID: string, rules: Record<string, ImportedMerchantRule>): Promise<ImportFinalModal> {
    const importFinalModal: ImportFinalModal = {
        titleKey: 'spreadsheet.importSuccessfulTitle',
        promptKey: 'spreadsheet.importMerchantRulesSuccessfulDescription',
        promptKeyParams: {rules: Object.keys(rules).length},
    };

    const parameters: ImportMerchantRulesSpreadsheetParams = {
        policyID,
        rules: JSON.stringify(rules),
    };

    try {
        // We need the server result immediately so the initiating page can show the final confirmation modal
        // without storing transient modal state in Onyx.
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.IMPORT_MERCHANT_RULES_SPREADSHEET, parameters);
        return response?.jsonCode === CONST.JSON_CODE.SUCCESS ? importFinalModal : getImportFailedFinalModal();
    } catch {
        return getImportFailedFinalModal();
    }
}

function getTransactionsMatchingCodingRule(policyID: string, filters: CodingRuleFilter) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW,
            value: true,
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW,
            value: false,
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW,
            value: false,
        },
    ];

    return API.read(READ_COMMANDS.GET_TRANSACTIONS_MATCHING_CODING_RULE, {policyID, filters: JSON.stringify(filters)}, {optimisticData, successData, failureData});
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
                            [ruleID]: {
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        codingRules: {
                            [ruleID]: null,
                        },
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
                            [ruleID]: {
                                ...existingRule,
                                pendingAction: null,
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
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

function addPolicyAgentRule(policyID: string, agentRuleID: string, prompt: string) {
    if (!policyID || !agentRuleID || !prompt) {
        Log.warn('Invalid params for addPolicyAgentRule', {policyID, agentRuleID, prompt});
        return;
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        agentRules: {
                            [agentRuleID]: {
                                ruleID: agentRuleID,
                                created: new Date().toISOString(),
                                prompt,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        agentRules: {
                            [agentRuleID]: {
                                pendingAction: null,
                                errors: null,
                            },
                        },
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
                        agentRules: {
                            [agentRuleID]: {
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters: AddPolicyAgentRuleParams = {
        policyID,
        agentRuleID,
        prompt,
    };

    API.write(WRITE_COMMANDS.ADD_POLICY_AGENT_RULE, parameters, onyxData);
}

function updatePolicyAgentRule(policyID: string, agentRuleID: string, prompt: string, previousPrompt: string) {
    if (!policyID || !agentRuleID || !prompt) {
        Log.warn('Invalid params for updatePolicyAgentRule', {policyID, agentRuleID, prompt});
        return;
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        agentRules: {
                            [agentRuleID]: {
                                prompt,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        agentRules: {
                            [agentRuleID]: {
                                pendingAction: null,
                                errors: null,
                            },
                        },
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
                        agentRules: {
                            [agentRuleID]: {
                                prompt: previousPrompt,
                                pendingAction: null,
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters: UpdatePolicyAgentRuleParams = {
        policyID,
        agentRuleID,
        prompt,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_AGENT_RULE, parameters, onyxData);
}

function deletePolicyAgentRule(policy: Policy, agentRuleID: string) {
    if (!policy.id || !agentRuleID) {
        Log.warn('Invalid params for deletePolicyAgentRule', {policyID: policy.id, agentRuleID});
        return;
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;
    const existingRule = policy.rules?.agentRules?.[agentRuleID];

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        agentRules: {
                            [agentRuleID]: {
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    rules: {
                        agentRules: {
                            [agentRuleID]: null,
                        },
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
                        agentRules: {
                            [agentRuleID]: {
                                ...existingRule,
                                pendingAction: null,
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters: DeletePolicyAgentRuleParams = {
        policyID: policy.id,
        agentRuleID,
    };

    API.write(WRITE_COMMANDS.DELETE_POLICY_AGENT_RULE, parameters, onyxData);
}

function clearPolicyCodingRuleErrors(policyID: string, ruleID: string, rule: CodingRule | undefined) {
    if (!rule) {
        return;
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    if (rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(policyKey, {
            rules: {
                codingRules: {
                    [ruleID]: null,
                },
            },
        });
        return;
    }

    Onyx.merge(policyKey, {
        rules: {
            codingRules: {
                [ruleID]: {
                    errors: null,
                },
            },
        },
    });
}

function clearPolicyAgentRuleErrors(policyID: string, agentRuleID: string, agentRule: AgentRule | undefined) {
    if (!agentRule) {
        return;
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    if (agentRule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(policyKey, {
            rules: {
                agentRules: {
                    [agentRuleID]: null,
                },
            },
        });
        return;
    }

    Onyx.merge(policyKey, {
        rules: {
            agentRules: {
                [agentRuleID]: {
                    errors: null,
                },
            },
        },
    });
}

export {
    openPolicyRulesPage,
    setPolicyCodingRule,
    importMerchantRulesSpreadsheet,
    deletePolicyCodingRule,
    getTransactionsMatchingCodingRule,
    addPolicyAgentRule,
    updatePolicyAgentRule,
    deletePolicyAgentRule,
    clearPolicyCodingRuleErrors,
    clearPolicyAgentRuleErrors,
};
export type {ImportedMerchantRule};
