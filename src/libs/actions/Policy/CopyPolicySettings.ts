import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {write} from '@libs/API';
import type {CopyPolicySettingsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {generateHexadecimalValue} from '@libs/NumberUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CopyPolicySettings as CopyPolicySettingsState, Policy, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import type {CustomUnit} from '@src/types/onyx/Policy';

type Part = 'overview' | 'members' | 'reports' | 'accounting' | 'categories' | 'tags' | 'taxes' | 'workflows' | 'rules' | 'codingRules' | 'distanceRates' | 'perDiem' | 'invoices' | 'travel';

const PARTS_TO_POLICY_FIELDS = {
    overview: ['outputCurrency', 'address', 'description'],
    members: ['employeeList'],
    reports: ['fieldList', 'areReportFieldsEnabled'],
    accounting: ['connections', 'areConnectionsEnabled'],
    categories: ['areCategoriesEnabled'],
    tags: ['areTagsEnabled'],
    taxes: ['tax', 'taxRates'],
    // achAccount is intentionally excluded — the backend remaps bankAccountID per-caller
    // (see Auth PR #21638). We rely on the server push for that field.
    workflows: ['areWorkflowsEnabled', 'autoReportingFrequency', 'autoReporting', 'autoReportingOffset', 'harvesting', 'approvalMode', 'autoApproval', 'reimbursementChoice'],
    rules: [
        'areRulesEnabled',
        'maxExpenseAmount',
        'maxExpenseAge',
        'maxExpenseAmountNoReceipt',
        'maxExpenseAmountNoItemizedReceipt',
        'defaultBillable',
        'prohibitedExpenses',
        'eReceipts',
        'isAttendeeTrackingEnabled',
        'preventSelfApproval',
        'shouldShowAutoApprovalOptions',
        'shouldShowAutoReimbursementLimitOption',
    ],
    codingRules: ['rules'],
    distanceRates: ['areDistanceRatesEnabled', 'customUnits'],
    perDiem: ['arePerDiemRatesEnabled', 'customUnits'],
    invoices: ['areInvoicesEnabled', 'invoice'],
    travel: ['isTravelEnabled', 'travelSettings'],
} as const satisfies Record<Part, ReadonlyArray<keyof Policy>>;

type PolicyFieldsForPart = (typeof PARTS_TO_POLICY_FIELDS)[Part][number];

function setCopyPolicySettingsData(data: Partial<CopyPolicySettingsState>): void {
    Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, data);
}

function clearCopyPolicySettings(): void {
    Onyx.set(ONYXKEYS.COPY_POLICY_SETTINGS, {});
}

function requestCopyPolicySettingsNotification(): void {
    write(WRITE_COMMANDS.COPY_POLICY_SETTINGS_NOTIFY, {});
}

function findCustomUnitByName(policy: Policy | undefined, unitName: string): CustomUnit | undefined {
    if (!policy?.customUnits) {
        return undefined;
    }
    return Object.values(policy.customUnits).find((unit) => unit.name === unitName);
}

/**
 * Returns the customUnits patch to merge into the target policy when distanceRates and/or perDiem are
 * being copied. The source unit data is written under the target's existing unit ID — a new ID is
 * generated only when the target has no unit of that type yet.
 */
function buildCustomUnitsPatch(sourcePolicy: Policy, targetPolicy: Policy, isDistanceSelected: boolean, isPerDiemSelected: boolean): {customUnits: Record<string, CustomUnit>} | undefined {
    if (!isDistanceSelected && !isPerDiemSelected) {
        return undefined;
    }

    const patch: Record<string, CustomUnit> = {};

    if (isDistanceSelected) {
        const sourceDistance = findCustomUnitByName(sourcePolicy, CONST.CUSTOM_UNITS.NAME_DISTANCE);
        if (sourceDistance) {
            const targetDistance = findCustomUnitByName(targetPolicy, CONST.CUSTOM_UNITS.NAME_DISTANCE);
            const targetUnitID = targetDistance?.customUnitID ?? generateHexadecimalValue(13);
            patch[targetUnitID] = {...sourceDistance, customUnitID: targetUnitID};
        }
    }

    if (isPerDiemSelected) {
        const sourcePerDiem = findCustomUnitByName(sourcePolicy, CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL);
        if (sourcePerDiem) {
            const targetPerDiem = findCustomUnitByName(targetPolicy, CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL);
            const targetUnitID = targetPerDiem?.customUnitID ?? generateHexadecimalValue(13);
            patch[targetUnitID] = {...sourcePerDiem, customUnitID: targetUnitID};
        }
    }

    if (Object.keys(patch).length === 0) {
        return undefined;
    }
    return {customUnits: patch};
}

/**
 * Returns the partial Policy patch derived from the selected `parts`, excluding fields whose
 * mapping is handled separately (customUnits, categories, tags collection keys).
 */
function buildPolicyFieldPatch(sourcePolicy: Policy, parts: Part[]): Partial<Policy> {
    const patch: Partial<Policy> = {};
    for (const part of parts) {
        for (const field of PARTS_TO_POLICY_FIELDS[part]) {
            if (field === 'customUnits') {
                continue;
            }
            if (part === 'codingRules' && field === 'rules') {
                continue;
            }
            // The PARTS_TO_POLICY_FIELDS values are typed as keyof Policy, so this assignment is safe.
            (patch as Record<string, unknown>)[field] = sourcePolicy[field as keyof Policy];
        }
    }
    return patch;
}

function buildExpandedPendingFields(parts: Part[]): Partial<Record<PolicyFieldsForPart, typeof CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE>> {
    const pendingFields: Partial<Record<PolicyFieldsForPart, typeof CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE>> = {};
    for (const part of parts) {
        for (const field of PARTS_TO_POLICY_FIELDS[part]) {
            pendingFields[field] = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
        }
    }
    return pendingFields;
}

function buildClearedPendingFields(parts: Part[]): Partial<Record<PolicyFieldsForPart, null>> {
    const cleared: Partial<Record<PolicyFieldsForPart, null>> = {};
    for (const part of parts) {
        for (const field of PARTS_TO_POLICY_FIELDS[part]) {
            cleared[field] = null;
        }
    }
    return cleared;
}

type CopyPolicySettingsOnyxKeys =
    | typeof ONYXKEYS.COLLECTION.POLICY
    | typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES
    | typeof ONYXKEYS.COLLECTION.POLICY_TAGS
    | typeof ONYXKEYS.COPY_POLICY_SETTINGS;

function buildCopyPolicySettingsData(
    sourcePolicy: Policy,
    targetPolicies: Policy[],
    parts: Part[],
    allPolicyCategories: OnyxCollection<PolicyCategories>,
    allPolicyTags: OnyxCollection<PolicyTagLists>,
): {
    optimisticData: Array<OnyxUpdate<CopyPolicySettingsOnyxKeys>>;
    successData: Array<OnyxUpdate<CopyPolicySettingsOnyxKeys>>;
    failureData: Array<OnyxUpdate<CopyPolicySettingsOnyxKeys>>;
} {
    const optimisticData: Array<OnyxUpdate<CopyPolicySettingsOnyxKeys>> = [];
    const successData: Array<OnyxUpdate<CopyPolicySettingsOnyxKeys>> = [];
    const failureData: Array<OnyxUpdate<CopyPolicySettingsOnyxKeys>> = [];

    const policyFieldPatch = buildPolicyFieldPatch(sourcePolicy, parts);
    const pendingFields = buildExpandedPendingFields(parts);
    const clearedPendingFields = buildClearedPendingFields(parts);

    const isCategoriesSelected = parts.includes('categories');
    const isTagsSelected = parts.includes('tags');
    const isDistanceSelected = parts.includes('distanceRates');
    const isPerDiemSelected = parts.includes('perDiem');
    const isCodingRulesSelected = parts.includes('codingRules');

    const sourceCategoriesKey = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${sourcePolicy.id}` as const;
    const sourceTagsKey = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${sourcePolicy.id}` as const;
    const sourceCategories = allPolicyCategories?.[sourceCategoriesKey] ?? {};
    const sourceTags = allPolicyTags?.[sourceTagsKey] ?? {};
    const filterPendingDeleteData = <T>(data?: Record<string, T>): Record<string, T> | undefined =>
        data
            ? (Object.fromEntries(
                  Object.entries(data).filter(([, value]) => {
                      if (!value || typeof value !== 'object' || !('pendingAction' in value)) {
                          return true;
                      }
                      return value.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                  }),
              ) as Record<string, T>)
            : undefined;
    const codingRulesWithoutPendingDelete = filterPendingDeleteData(sourcePolicy.rules?.codingRules);

    for (const targetPolicy of targetPolicies) {
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${targetPolicy.id}` as const;
        const customUnitsPatch = buildCustomUnitsPatch(sourcePolicy, targetPolicy, isDistanceSelected, isPerDiemSelected);
        const codingRulesPatch = isCodingRulesSelected
            ? {
                  rules: {
                      ...targetPolicy.rules,
                      codingRules: codingRulesWithoutPendingDelete,
                  },
              }
            : {};

        // Step 1+2: SET the full policy with patched fields overlaid.
        // We use SET (not MERGE) because Onyx.merge deep-merges nested objects — source
        // values would be merged into target's, leaving stale nested keys behind.
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: policyKey,
            value: {
                ...targetPolicy,
                ...policyFieldPatch,
                ...(customUnitsPatch ? {customUnits: {...targetPolicy.customUnits, ...customUnitsPatch.customUnits}} : {}),
                ...codingRulesPatch,
                pendingFields: {...targetPolicy.pendingFields, ...pendingFields},
            },
        });

        // Success: clear pending markers and any leftover errors from a prior failure
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                pendingFields: clearedPendingFields,
                errors: null,
            },
        });

        // Failure: restore the original target policy in full, surface RBR
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: policyKey,
            value: {
                ...targetPolicy,
                errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.copyPolicySettings.error'),
            },
        });

        // Step 3: collection keys (categories / tags) — SET-level overwrite with snapshot rollback
        if (isCategoriesSelected) {
            const targetCategoriesKey = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${targetPolicy.id}` as const;
            const previousCategories = allPolicyCategories?.[targetCategoriesKey] ?? {};
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: targetCategoriesKey,
                value: sourceCategories,
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: targetCategoriesKey,
                value: previousCategories,
            });
        }

        if (isTagsSelected) {
            const targetTagsKey = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicy.id}` as const;
            const previousTags = allPolicyTags?.[targetTagsKey] ?? {};
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: targetTagsKey,
                value: sourceTags,
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: targetTagsKey,
                value: previousTags,
            });
        }
    }

    // Surface an RBR on the source policy row so the admin knows the bulk copy failed
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.POLICY}${sourcePolicy.id}` as const,
        value: {
            errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.copyPolicySettings.error'),
        },
    });

    // Clear source policy errors on success (in case this is a retry after failure)
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.POLICY}${sourcePolicy.id}` as const,
        value: {
            errors: null,
        },
    });

    // Step 4: drive currentStep on the COPY_POLICY_SETTINGS key itself.
    // Success intentionally omits this key — the backend transitions currentStep
    // to 'complete' via the bulkCopySettings NVP push.
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.COPY_POLICY_SETTINGS,
        value: {currentStep: 'loading'},
    });

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.COPY_POLICY_SETTINGS,
        value: {currentStep: null},
    });

    return {optimisticData, successData, failureData};
}

function copyPolicySettings(
    sourcePolicy: Policy,
    targetPolicies: Policy[],
    parts: Part[],
    allPolicyCategories: OnyxCollection<PolicyCategories>,
    allPolicyTags: OnyxCollection<PolicyTagLists>,
): void {
    const {optimisticData, successData, failureData} = buildCopyPolicySettingsData(sourcePolicy, targetPolicies, parts, allPolicyCategories, allPolicyTags);

    const params: CopyPolicySettingsParams = {
        policyID: sourcePolicy.id,
        policyIDList: targetPolicies.map((policy) => policy.id).join(','),
        parts: parts.join(','),
    };

    write(WRITE_COMMANDS.COPY_POLICY_SETTINGS, params, {optimisticData, successData, failureData});
}

export {setCopyPolicySettingsData, clearCopyPolicySettings, requestCopyPolicySettingsNotification, buildCopyPolicySettingsData, copyPolicySettings};
export type {Part};
