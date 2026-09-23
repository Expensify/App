import {getImportFailedFinalModal} from '@libs/actions/ImportSpreadsheet';
import * as API from '@libs/API';
import type {
    AddPolicyAgentRuleParams,
    DeletePolicyAgentRuleParams,
    GetAgentRuleSuggestionsParams,
    ImportMerchantRulesSpreadsheetParams,
    UpdatePolicyAgentRuleParams,
} from '@libs/API/parameters';
import type OpenPolicyRulesPageParams from '@libs/API/parameters/OpenPolicyRulesPageParams';
import type SetPolicyCodingRuleParams from '@libs/API/parameters/SetPolicyCodingRuleParams';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import {buildMerchantRule, isExpenseDefaultTaxValue} from '@libs/ExpenseDefaultRuleUtils';
import type {BuiltMerchantRule, MerchantRuleFormValues} from '@libs/ExpenseDefaultRuleUtils';
import Log from '@libs/Log';
import * as NumberUtils from '@libs/NumberUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpenseDefaultAction} from '@src/types/onyx/ExpenseDefaultRules';
import type {ImportFinalModal} from '@src/types/onyx/ImportedSpreadsheet';
import type Policy from '@src/types/onyx/Policy';
import type {AgentRule, CodingRule, CodingRuleFilter} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** A coding rule parsed from an imported spreadsheet row, keyed by a client-generated ruleID */
type ImportedMerchantRule = Omit<CodingRule, 'ruleID' | 'pendingAction' | 'errors'>;

/**
 * Builds the `codingRuleValue` sent to `SetPolicyCodingRule`. We still write through the legacy command rather than
 * `SetRule`, because `SetPolicyCodingRule` dual-writes into both `policy.rules.codingRules` and the `rules_`
 * collection, while `SetRule` only writes the new collection, so older clients reading `codingRules` would silently
 * stop seeing rules created or edited on a newer client.
 *
 * This reads the built rule rather than the form so the optimistic Onyx value and the saved rule share one
 * definition of what an empty field is. Reading the form separately let a padded merchant, a whitespace-only
 * description, or a tax selected before the rates loaded reach the server after the rule had already dropped it.
 */
function buildLegacyCodingRule(ruleValue: BuiltMerchantRule, ruleID: string, created: string): Partial<CodingRule> {
    const {ACTION, FIELD} = CONST.RULES.EXPENSE_DEFAULT;

    const valuesByField = new Map<string, ExpenseDefaultAction['value']>();
    for (const action of Object.values(ruleValue.actions)) {
        if (action.name !== ACTION.SET) {
            continue;
        }
        valuesByField.set(action.field, action.value);
    }

    const getStringValue = (field: string): string | undefined => {
        const value = valuesByField.get(field);
        return typeof value === 'string' ? value : undefined;
    };
    const getBooleanValue = (field: string): boolean | undefined => {
        const value = valuesByField.get(field);
        return typeof value === 'boolean' ? value : undefined;
    };

    const taxValue = valuesByField.get(FIELD.TAX);
    const tax = isExpenseDefaultTaxValue(taxValue) ? taxValue : undefined;
    const merchant = getStringValue(FIELD.MERCHANT);
    const category = getStringValue(FIELD.CATEGORY);
    const tag = getStringValue(FIELD.TAG);
    const vendorID = getStringValue(FIELD.VENDOR_ID);
    const comment = getStringValue(FIELD.COMMENT);
    const reimbursable = getBooleanValue(FIELD.REIMBURSABLE);
    const billable = getBooleanValue(FIELD.BILLABLE);

    const {left, operator, right} = ruleValue.filters;

    return {
        ruleID,
        filters: {
            left,
            operator,
            right: typeof right === 'string' ? right : String(right),
        },
        ...(merchant && {merchant}),
        ...(category && {category}),
        ...(tag && {tag}),
        ...(tax && {tax}),
        ...(vendorID && {vendorID}),
        ...(comment && {comment}),
        ...(reimbursable !== undefined && {reimbursable}),
        ...(billable !== undefined && {billable}),
        created,
    };
}

/**
 * Fetches every rule the user has access to. The response SETs the whole `rules_` collection.
 *
 * The flag lets screens that only consume the collection fetch it once rather than on every mount. It
 * lives in Onyx rather than in this module so it is cleared along with the rest of the data on sign out.
 */
function getRules() {
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.HAS_RULES_DATA_BEEN_FETCHED>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.HAS_RULES_DATA_BEEN_FETCHED,
            value: true,
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.HAS_RULES_DATA_BEEN_FETCHED>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.HAS_RULES_DATA_BEEN_FETCHED,
            value: false,
        },
    ];

    API.read(READ_COMMANDS.GET_RULES, {}, {successData, failureData});
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

    const parameters: SetPolicyCodingRuleParams = {
        policyID,
        codingRuleID: targetRuleID,
        codingRuleValue: JSON.stringify(buildLegacyCodingRule(ruleValue, targetRuleID, created)),
        shouldUpdateMatchingTransactions,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CODING_RULE, parameters, onyxData);
}

/**
 * Imports coding rules parsed from a spreadsheet into the given policy in bulk
 * @param policyID - The ID of the policy to import the rules into
 * @param rules - Coding rule values keyed by client-generated ruleID
 * @param invalidCategoryCount - Number of imported categories that don't exist on the policy, reported in the confirmation modal
 * @param invalidVendorCount - Number of imported vendors that don't exist on the policy, reported in the confirmation modal
 */
async function importMerchantRulesSpreadsheet(policyID: string, rules: Record<string, ImportedMerchantRule>, invalidCategoryCount = 0, invalidVendorCount = 0): Promise<ImportFinalModal> {
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
        ...(invalidVendorCount > 0 && {
            secondaryPendingMessageKey: 'spreadsheet.importMerchantRulesSkippedVendors',
            secondaryPendingMessageKeyParams: {count: invalidVendorCount},
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
 * @param policyID - The ID of the policy the rule belongs to
 * @param ruleID - The ID of the rule to delete
 * @param rule - The rule being deleted, restored on failure
 */
function deleteMerchantRule(policyID: string, ruleID: string, rule: Rule | undefined) {
    if (!policyID || !ruleID) {
        Log.warn('Invalid params for deleteMerchantRule', {policyID, ruleID});
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

    // An empty codingRuleValue tells SetPolicyCodingRule to delete rather than upsert the rule.
    const parameters: SetPolicyCodingRuleParams = {
        policyID,
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
