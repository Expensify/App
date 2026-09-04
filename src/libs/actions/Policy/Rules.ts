import {getImportFailedFinalModal} from '@libs/actions/ImportSpreadsheet';
import * as API from '@libs/API';
import type {
    AddPolicyAgentRuleParams,
    DeletePolicyAgentRuleParams,
    DeleteRuleParams,
    GetAgentRuleSuggestionsParams,
    ImportMerchantRulesSpreadsheetParams,
    SetRuleParams,
    UpdatePolicyAgentRuleParams,
} from '@libs/API/parameters';
import type OpenPolicyRulesPageParams from '@libs/API/parameters/OpenPolicyRulesPageParams';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import {buildMerchantRule} from '@libs/ExpenseDefaultRuleUtils';
import type {MerchantRuleFormValues} from '@libs/ExpenseDefaultRuleUtils';
import Log from '@libs/Log';
import * as NumberUtils from '@libs/NumberUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportFinalModal} from '@src/types/onyx/ImportedSpreadsheet';
import type Policy from '@src/types/onyx/Policy';
import type {AgentRule, CodingRule, CodingRuleFilter} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** A coding rule parsed from an imported spreadsheet row, keyed by a client-generated ruleID */
type ImportedMerchantRule = Omit<CodingRule, 'ruleID' | 'pendingAction' | 'errors'>;

/** Fetches every rule the user has access to. The response SETs the whole `rules_` collection. */
function getRules() {
    API.read(READ_COMMANDS.GET_RULES, {});
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
    getRules();
}

/**
 * Fetches ready-made agent rule suggestions for the add-agent-rule Suggestions tab.
 */
function getAgentRuleSuggestions(policyID: string | undefined) {
    if (!policyID) {
        Log.warn('Invalid params for getAgentRuleSuggestions', {policyID});
        return;
    }

    const params: GetAgentRuleSuggestionsParams = {policyID};
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_AGENT_RULE_SUGGESTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_AGENT_RULE_SUGGESTIONS,
            value: true,
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_AGENT_RULE_SUGGESTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_AGENT_RULE_SUGGESTIONS,
            value: false,
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_AGENT_RULE_SUGGESTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_AGENT_RULE_SUGGESTIONS,
            value: false,
        },
    ];

    API.read(READ_COMMANDS.GET_AGENT_RULE_SUGGESTIONS, params, {optimisticData, successData, failureData});
}

/**
 * Creates or updates a coding rule for the given policy
 * @param policyID - The ID of the policy to create/update the rule for
 * @param form - The form data for the merchant rule
 * @param policy - The policy object (needed to build tax data)
 * @param ruleID - Optional existing rule ID for updates
 * @param shouldUpdateMatchingTransactions - Whether to update transactions that match the rule
 */
/**
 * Creates or updates a merchant rule. Editing a rule reuses its `ruleID`, since the rules engine has no separate update command.
 * @param policyID - The ID of the policy the rule belongs to
 * @param formValues - The merchant rule editor's values
 * @param policy - Used to resolve the selected tax rate
 * @param ruleID - The ID of the rule being edited, or undefined to create one
 * @param existingRule - The rule being edited, restored on failure
 * @param shouldUpdateMatchingTransactions - Whether to apply the rule to transactions that already match it
 */
function setMerchantRule(
    policyID: string,
    formValues: Partial<MerchantRuleFormValues>,
    policy: Policy | undefined,
    ruleID?: string,
    existingRule?: Rule,
    shouldUpdateMatchingTransactions = false,
) {
    const ruleValue = buildMerchantRule(formValues, policy);

    if (!policyID || !ruleValue) {
        Log.warn('Invalid params for setMerchantRule', {policyID, merchantToMatch: formValues.merchantToMatch});
        return;
    }

    const isEditing = !!ruleID;
    const targetRuleID = ruleID ?? NumberUtils.rand64();
    const ruleKey = `${ONYXKEYS.COLLECTION.RULE}${targetRuleID}` as const;
    const created = existingRule?.created ?? new Date().toISOString();

    const optimisticRule: Rule = {
        ...ruleValue,
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: policyID,
        priority: CONST.RULES.EXPENSE_DEFAULT.PRIORITY,
        created,
        pendingAction: isEditing ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.RULE> = {
        // SET rather than MERGE: clearing a field removes its action, and a merge would leave the stale one behind.
        optimisticData: [{onyxMethod: Onyx.METHOD.SET, key: ruleKey, value: {...optimisticRule, errors: null}}],
        successData: [{onyxMethod: Onyx.METHOD.MERGE, key: ruleKey, value: {pendingAction: null, errors: null}}],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ruleKey,
                // Keep the rule visible with its error so the admin can retry or dismiss it, restoring the pre-edit value.
                value: {
                    ...(isEditing && existingRule ? existingRule : optimisticRule),
                    pendingAction: isEditing ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    const parameters: SetRuleParams = {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: policyID,
        ruleID: targetRuleID,
        priority: CONST.RULES.EXPENSE_DEFAULT.PRIORITY,
        value: JSON.stringify(ruleValue),
        shouldUpdateMatchingTransactions,
    };

    API.write(WRITE_COMMANDS.SET_RULE, parameters, onyxData);
}

/**
 * Imports coding rules parsed from a spreadsheet into the given policy in bulk
 * @param policyID - The ID of the policy to import the rules into
 * @param rules - Coding rule values keyed by client-generated ruleID
 * @param invalidCategoryCount - Number of imported categories that don't exist on the policy, reported in the confirmation modal
 */
async function importMerchantRulesSpreadsheet(policyID: string, rules: Record<string, ImportedMerchantRule>, invalidCategoryCount = 0): Promise<ImportFinalModal> {
    // The API rejects an empty rules object, so fail fast when the spreadsheet produced no importable rules
    if (Object.keys(rules).length === 0) {
        return getImportFailedFinalModal();
    }

    const importFinalModal: ImportFinalModal = {
        titleKey: 'spreadsheet.importSuccessfulTitle',
        promptKey: 'spreadsheet.importMerchantRulesSuccessfulDescription',
        promptKeyParams: {count: Object.keys(rules).length},
        ...(invalidCategoryCount > 0 && {
            pendingMessageKey: 'spreadsheet.importMerchantRulesSkippedCategories',
            pendingMessageKeyParams: {count: invalidCategoryCount},
        }),
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
 * Deletes a merchant rule
 * @param ruleID - The ID of the rule to delete
 * @param rule - The rule being deleted, restored on failure
 */
function deleteMerchantRule(ruleID: string, rule: Rule | undefined) {
    if (!ruleID) {
        Log.warn('Invalid params for deleteMerchantRule');
        return;
    }

    const ruleKey = `${ONYXKEYS.COLLECTION.RULE}${ruleID}` as const;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.RULE> = {
        optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: ruleKey, value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null}}],
        successData: [{onyxMethod: Onyx.METHOD.SET, key: ruleKey, value: null}],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ruleKey,
                value: rule ? {...rule, pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')} : null,
            },
        ],
    };

    const parameters: DeleteRuleParams = {ruleID};

    API.write(WRITE_COMMANDS.DELETE_RULE, parameters, onyxData);
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

function updatePolicyAgentRule(policyID: string, agentRuleID: string, prompt: string, previousPrompt: string, previousTitle?: string) {
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
                                // Clear the stale title so the list falls back to the new prompt until the server
                                // returns the regenerated title.
                                title: null,
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
                                title: previousTitle ?? null,
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

function clearMerchantRuleErrors(ruleID: string, rule: Rule | undefined) {
    if (!rule) {
        return;
    }

    const ruleKey = `${ONYXKEYS.COLLECTION.RULE}${ruleID}` as const;

    // A rule that never made it to the server has nothing to keep once its error is dismissed.
    if (rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.set(ruleKey, null);
        return;
    }

    Onyx.merge(ruleKey, {errors: null});
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
    getAgentRuleSuggestions,
    getRules,
    setMerchantRule,
    importMerchantRulesSpreadsheet,
    deleteMerchantRule,
    getTransactionsMatchingCodingRule,
    addPolicyAgentRule,
    updatePolicyAgentRule,
    deletePolicyAgentRule,
    clearMerchantRuleErrors,
    clearPolicyAgentRuleErrors,
};
export type {ImportedMerchantRule};
