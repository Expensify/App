import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import * as API from '@libs/API';
import type {
    CreatePolicyDistanceRateParams,
    DeletePolicyDistanceRatesParams,
    DisablePolicyCommuterExclusionsParams,
    EnablePolicyDistanceRatesParams,
    OpenPolicyDistanceRatesPageParams,
    SetEmployeeWorkArrangementParams,
    SetPolicyCommuterExclusionsParams,
    SetPolicyDistanceRatesEnabledParams,
    SetPolicyDistanceRatesUnitParams,
    SetPolicyRequireMapOrGPSParams,
    SetPolicyWorkArrangementParams,
    SetWorkspaceDistanceAutoUpdateParams,
    UpdatePolicyDistanceRateParams,
    UpdatePolicyDistanceRateValueParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {rand64} from '@libs/NumberUtils';
import {buildOnyxDataForGovernmentRateAutoUpdate, buildOnyxDataForPolicyDistanceRateUpdates} from '@libs/PolicyDistanceRatesUtils';
import {goBackWhenEnableFeature, removePendingFieldsFromCustomUnit} from '@libs/PolicyUtils';
import {getRoom} from '@libs/ReportUtils';
import {getWorkArrangementLabel} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GovernmentMileageRate, PersonalDetailsList, Policy, PolicyEmployee, ReportAction, TransactionViolation} from '@src/types/onyx';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';
import type {CommuterExclusions, CustomUnit, Rate} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

/**
 * Takes array of customUnitRates and removes pendingFields and errorFields from each rate - we don't want to send those via API
 */
function prepareCustomUnitRatesArray(customUnitRates: Rate[]): Rate[] {
    const customUnitRateArray: Rate[] = [];
    for (const rate of customUnitRates) {
        const cleanedRate = {...rate};
        delete cleanedRate.pendingFields;
        delete cleanedRate.errorFields;
        customUnitRateArray.push(cleanedRate);
    }

    return customUnitRateArray;
}

function openPolicyDistanceRatesPage(policyID?: string) {
    if (!policyID) {
        return;
    }

    const params: OpenPolicyDistanceRatesPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_DISTANCE_RATES_PAGE, params);
}

function enablePolicyDistanceRates(policyID: string, enabled: boolean, customUnit: CustomUnit | undefined) {
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areDistanceRatesEnabled: enabled,
                    pendingFields: {
                        areDistanceRatesEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        areDistanceRatesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areDistanceRatesEnabled: !enabled,
                    pendingFields: {
                        areDistanceRatesEnabled: null,
                    },
                },
            },
        ],
    };

    if (!enabled && customUnit) {
        const customUnitID = customUnit.customUnitID;
        const rateEntries = Object.entries(customUnit.rates ?? {});
        // find the rate to be enabled after disabling the distance rate feature
        const rateEntryToBeEnabled = rateEntries.at(0);

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: Object.fromEntries(
                            rateEntries.map((rateEntry) => {
                                const [rateID, rate] = rateEntry;
                                return [
                                    rateID,
                                    {
                                        ...rate,
                                        enabled: rateID === rateEntryToBeEnabled?.at(0),
                                    },
                                ];
                            }),
                        ),
                    },
                },
            },
        });
    }

    const parameters: EnablePolicyDistanceRatesParams = {policyID, enabled};

    // We can't use writeWithNoDuplicatesEnableFeatureConflicts because the distance rates data is also changed when disabling/enabling this feature
    API.write(WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        goBackWhenEnableFeature();
    }
}

function createPolicyDistanceRate(policyID: string, customUnitID: string, customUnitRate: Rate) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID]: {
                                ...customUnitRate,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID]: {
                                pendingAction: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID]: {
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const params: CreatePolicyDistanceRateParams = {
        policyID,
        customUnitID,
        customUnitRate: JSON.stringify(customUnitRate),
    };

    API.write(WRITE_COMMANDS.CREATE_POLICY_DISTANCE_RATE, params, {optimisticData, successData, failureData});
}

function clearCreateDistanceRateItemAndError(policyID: string, customUnitID: string, customUnitRateIDToClear: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                rates: {
                    [customUnitRateIDToClear]: null,
                },
            },
        },
    });
}

function clearPolicyDistanceRatesErrorFields(policyID: string, customUnitID: string, updatedErrorFields: ErrorFields) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                errorFields: updatedErrorFields,
            },
        },
    });
}

function clearDeleteDistanceRateError(policyID: string, customUnitID: string, rateID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                rates: {
                    [rateID]: {
                        errors: null,
                    },
                },
            },
        },
    });
}

function clearPolicyDistanceRateErrorFields(policyID: string, customUnitID: string, rateID: string, updatedErrorFields: ErrorFields) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                rates: {
                    [rateID]: {
                        errorFields: updatedErrorFields,
                    },
                },
            },
        },
    });
}

function setPolicyDistanceRatesUnit(policyID: string, currentCustomUnit: CustomUnit, newCustomUnit: CustomUnit) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        ...newCustomUnit,
                        pendingFields: {attributes: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        pendingFields: {attributes: null},
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [currentCustomUnit.customUnitID]: {
                        ...currentCustomUnit,
                        errorFields: {attributes: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        pendingFields: {attributes: null},
                    },
                },
            },
        },
    ];

    const params: SetPolicyDistanceRatesUnitParams = {
        policyID,
        customUnit: JSON.stringify(removePendingFieldsFromCustomUnit(newCustomUnit)),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_UNIT, params, {optimisticData, successData, failureData});
}

function updatePolicyDistanceRateValue(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const {optimisticData, successData, failureData} = buildOnyxDataForPolicyDistanceRateUpdates(policyID, customUnit, customUnitRates, 'rate');

    const params: UpdatePolicyDistanceRateValueParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_VALUE, params, {optimisticData, successData, failureData});
}

function updatePolicyDistanceRateName(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const {optimisticData, successData, failureData} = buildOnyxDataForPolicyDistanceRateUpdates(policyID, customUnit, customUnitRates, 'name');

    const params: UpdatePolicyDistanceRateValueParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_NAME, params, {optimisticData, successData, failureData});
}

function updatePolicyDistanceRate(policyID: string, customUnit: CustomUnit, rateToUpdate: Rate, fieldName: keyof Pick<Rate, 'startDate' | 'endDate'>) {
    const {optimisticData, successData, failureData} = buildOnyxDataForPolicyDistanceRateUpdates(policyID, customUnit, [rateToUpdate], fieldName);

    const params: UpdatePolicyDistanceRateParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray([rateToUpdate])),
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE, params, {optimisticData, successData, failureData});
}

function setPolicyDistanceRatesEnabled(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, NullishDeep<Rate>> = {};
    const successRates: Record<string, NullishDeep<Rate>> = {};
    const failureRates: Record<string, NullishDeep<Rate>> = {};
    const rateIDs = new Set(customUnitRates.map((rate) => rate.customUnitRateID));

    for (const rateID of Object.keys(currentRates)) {
        if (rateIDs.has(rateID)) {
            const foundRate = customUnitRates.find((rate) => rate.customUnitRateID === rateID);
            optimisticRates[rateID] = {...foundRate, pendingFields: {enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}};
            successRates[rateID] = {...foundRate, pendingFields: {enabled: null}};
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {enabled: null},
                errorFields: {enabled: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            };
        }
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: optimisticRates,
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: successRates,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: failureRates,
                    },
                },
            },
        },
    ];

    const params: SetPolicyDistanceRatesEnabledParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_ENABLED, params, {optimisticData, successData, failureData});
}

function deletePolicyDistanceRates(
    policyID: string,
    customUnit: CustomUnit,
    rateIDsToDelete: string[],
    transactionIDsAffected: string[],
    transactionViolations: OnyxCollection<TransactionViolation[]>,
) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Partial<Rate>> = {};
    const failureRates: Record<string, Partial<Rate>> = {};

    for (const rateID of rateIDsToDelete) {
        optimisticRates[rateID] = {
            enabled: false,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        };
        failureRates[rateID] = {
            enabled: currentRates[rateID].enabled,
            pendingAction: null,
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
        };
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: optimisticRates,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: failureRates,
                    },
                },
            },
        },
    ];

    const optimisticTransactionsViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [];
    const failureTransactionsViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [];

    for (const transactionID of transactionIDsAffected) {
        const currentTransactionViolations = transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        if (currentTransactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY)) {
            continue;
        }

        optimisticTransactionsViolations.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: [
                ...currentTransactionViolations,
                {
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY,
                    showInReview: true,
                },
            ],
        });

        failureTransactionsViolations.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }

    optimisticData.push(...optimisticTransactionsViolations);
    failureData.push(...failureTransactionsViolations);

    const params: DeletePolicyDistanceRatesParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateID: rateIDsToDelete,
    };

    API.write(WRITE_COMMANDS.DELETE_POLICY_DISTANCE_RATES, params, {optimisticData, failureData});
}

function updateDistanceTaxClaimableValue(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const {optimisticData, successData, failureData} = buildOnyxDataForPolicyDistanceRateUpdates(policyID, customUnit, customUnitRates, 'taxClaimablePercentage');

    const params: UpdatePolicyDistanceRateValueParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE, params, {optimisticData, successData, failureData});
}

function updateDistanceTaxRate(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const {optimisticData, successData, failureData} = buildOnyxDataForPolicyDistanceRateUpdates(policyID, customUnit, customUnitRates, 'taxRateExternalID');

    const params: UpdatePolicyDistanceRateValueParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_TAX_RATE_VALUE, params, {optimisticData, successData, failureData});
}

/**
 * Set the commuter exclusion for a policy. Two methods are supported:
 *   - "fixedDistance" - subtracts a fixed distance per claim. `fixedDistance` (> 0) and `fixedDistanceUnit`
 *                       (mirrors the policy's distance custom unit) are required.
 *   - "homeAndOffice" - subtracts each member's home-to-office distance, computed per-claim from the
 *                       member's saved addresses. No client-side distance/unit needed. `isOffice` sets the
 *                       default work arrangement in the same request.
 *
 * Callers should pass the policy's current `commuterExclusions` so the failure path can restore
 * the prior state.
 */
function setPolicyCommuterExclusions(
    policyID: string,
    method: ValueOf<typeof CONST.POLICY.COMMUTER_EXCLUSION_METHOD>,
    fixedDistance: number | undefined,
    fixedDistanceUnit: string | undefined,
    previousCommuterExclusions: CommuterExclusions | undefined,
    isOffice?: boolean,
) {
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    const isFixedDistance = method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE;
    const isSettingWorkArrangement = !isFixedDistance && isOffice !== undefined;

    const optimisticCommuterExclusions: CommuterExclusions = isFixedDistance
        ? {method, fixedDistance, fixedDistanceUnit}
        : {method, ...(isSettingWorkArrangement ? {isOfficeWorkArrangement: isOffice} : {})};

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    commuterExclusions: optimisticCommuterExclusions,
                    pendingFields: {commuterExclusions: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    errorFields: {commuterExclusions: null},
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    pendingFields: {commuterExclusions: null},
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    // Merging the previous object back would keep an arrangement it never had, so that field is restored explicitly
                    commuterExclusions:
                        previousCommuterExclusions && isSettingWorkArrangement
                            ? {...previousCommuterExclusions, isOfficeWorkArrangement: previousCommuterExclusions.isOfficeWorkArrangement ?? null}
                            : (previousCommuterExclusions ?? null),
                    pendingFields: {commuterExclusions: null},
                    errorFields: {commuterExclusions: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    // Only send distance when the server actually needs it. HomeAndOffice ignores the field.
    const parameters: SetPolicyCommuterExclusionsParams = isFixedDistance
        ? {policyID, commuterExclusionMethod: method, distance: fixedDistance}
        : {policyID, commuterExclusionMethod: method, ...(isSettingWorkArrangement ? {isOffice} : {})};
    API.write(WRITE_COMMANDS.SET_POLICY_COMMUTER_EXCLUSIONS, parameters, onyxData);
}

/**
 * Set the workspace-wide default work arrangement, which only applies while the policy uses the
 * "homeAndOffice" commuter exclusion method. `isOffice` is true when members commute to an office and
 * false when they have no regular workplace.
 *
 * Callers should pass the policy's current value so the failure path can restore it.
 */
function setPolicyWorkArrangement(policyID: string, isOffice: boolean, previousIsOffice: boolean | undefined) {
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    commuterExclusions: {isOfficeWorkArrangement: isOffice},
                    pendingFields: {commuterExclusions: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    errorFields: {commuterExclusions: null},
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    pendingFields: {commuterExclusions: null},
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    commuterExclusions: {isOfficeWorkArrangement: previousIsOffice ?? null},
                    pendingFields: {commuterExclusions: null},
                    errorFields: {commuterExclusions: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters: SetPolicyWorkArrangementParams = {policyID, isOffice};
    API.write(WRITE_COMMANDS.SET_POLICY_WORK_ARRANGEMENT, parameters, onyxData);
}

/**
 * Disable the commuter exclusion for a policy.
 * `DisablePolicyCommuterExclusions` command that removes the policy NVP entirely.
 */
function disablePolicyCommuterExclusions(policyID: string, previousCommuterExclusions: CommuterExclusions | undefined) {
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    commuterExclusions: null,
                    pendingFields: {commuterExclusions: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    errorFields: {commuterExclusions: null},
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    pendingFields: {commuterExclusions: null},
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    commuterExclusions: previousCommuterExclusions ?? null,
                    pendingFields: {commuterExclusions: null},
                    errorFields: {commuterExclusions: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters: DisablePolicyCommuterExclusionsParams = {policyID};
    API.write(WRITE_COMMANDS.DISABLE_POLICY_COMMUTER_EXCLUSIONS, parameters, onyxData);
}

type WorkArrangementMemberUpdate = {
    /** The account ID of the workspace member being updated. */
    accountID: number;
    /** The member's login, used as the employeeList key and in the changelog action. */
    email: string;
    /** The member's display name, used in the changelog message. */
    name: string;
    /** The member's previous office arrangement, used to restore it if the update fails. */
    previousHasOfficeWorkArrangement: boolean | undefined;
    /** The member may still be an optimistic invite, so changing the arrangement must not clear its pending action. */
    previousPendingAction: PolicyEmployee['pendingAction'];
    /** The ID assigned to this member's optimistic changelog action. */
    optimisticReportActionID: string;
};

/**
 * Set the work arrangement (office-based or no regular workspace) for one or more policy members.
 * The single command covers both individual and bulk updates: employeeAccountIDList carries every
 * affected accountID, and one optimistic member work arrangement changelog action is
 * created per member in the workspace admins room.
 */
function setEmployeeWorkArrangement(
    policy: OnyxEntry<Policy>,
    employeeAccountIDList: number[],
    isOffice: boolean,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    translate: LocalizedTranslate,
) {
    const policyID = policy?.id;
    if (!policyID) {
        return;
    }
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    const newLabel = getWorkArrangementLabel(translate, isOffice);
    const updates: WorkArrangementMemberUpdate[] = [];
    for (const accountID of employeeAccountIDList) {
        const personalDetail = personalDetails?.[accountID];
        const login = personalDetail?.login;
        if (!login) {
            continue;
        }
        const employee = policy?.employeeList?.[login];
        if (!employee) {
            continue;
        }
        const previousHasOfficeWorkArrangement = employee.hasOfficeWorkArrangement;
        if (previousHasOfficeWorkArrangement === isOffice) {
            continue;
        }
        updates.push({
            accountID,
            email: login,
            name: personalDetail?.displayName ?? login,
            previousHasOfficeWorkArrangement,
            previousPendingAction: employee.pendingAction,
            optimisticReportActionID: rand64(),
        });
    }

    if (updates.length === 0) {
        return;
    }

    const created = DateUtils.getDBTime();
    const employeeListOptimisticUpdate: Record<string, Pick<PolicyEmployee, 'hasOfficeWorkArrangement' | 'pendingAction'>> = {};
    const employeeListSuccessUpdate: Record<string, Pick<PolicyEmployee, 'pendingAction'>> = {};
    const employeeListFailureUpdate: Record<string, NullishDeep<PolicyEmployee>> = {};
    for (const update of updates) {
        employeeListOptimisticUpdate[update.email] = {
            hasOfficeWorkArrangement: isOffice,
            pendingAction: update.previousPendingAction ?? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        };
        if (!update.previousPendingAction) {
            employeeListSuccessUpdate[update.email] = {pendingAction: null};
        }
        employeeListFailureUpdate[update.email] = {
            hasOfficeWorkArrangement: update.previousHasOfficeWorkArrangement ?? null,
            ...(!update.previousPendingAction && {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
        };
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {employeeList: employeeListOptimisticUpdate},
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {employeeList: employeeListSuccessUpdate},
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {employeeList: employeeListFailureUpdate},
        },
    ];

    const adminsRoom = getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, policyID);
    if (adminsRoom?.reportID) {
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsRoom.reportID}` as const;
        const optimisticReportActions: Record<string, ReportAction> = {};
        const successReportActions: Record<string, Pick<ReportAction, 'pendingAction'>> = {};
        const failureReportActions: Record<string, null> = {};
        for (const update of updates) {
            const previousLabel = getWorkArrangementLabel(translate, update.previousHasOfficeWorkArrangement ?? false);
            const text = translate('workspaceActions.updatedMemberWorkArrangement', {displayName: update.name, newArrangement: newLabel, oldArrangement: previousLabel});
            optimisticReportActions[update.optimisticReportActionID] = {
                reportActionID: update.optimisticReportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MEMBER_WORK_ARRANGEMENT,
                created,
                shouldShow: true,
                automatic: false,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                        html: `<muted-text>${text}</muted-text>`,
                        text,
                    },
                ],
                originalMessage: {
                    accountID: update.accountID,
                    email: update.email,
                    name: update.name,
                    newValue: isOffice,
                    oldValue: update.previousHasOfficeWorkArrangement ?? false,
                },
            };
            successReportActions[update.optimisticReportActionID] = {pendingAction: null};
            failureReportActions[update.optimisticReportActionID] = null;
        }
        optimisticData.push({onyxMethod: Onyx.METHOD.MERGE, key: reportActionsKey, value: optimisticReportActions});
        successData.push({onyxMethod: Onyx.METHOD.MERGE, key: reportActionsKey, value: successReportActions});
        failureData.push({onyxMethod: Onyx.METHOD.MERGE, key: reportActionsKey, value: failureReportActions});
    }

    const parameters: SetEmployeeWorkArrangementParams = {
        policyID,
        employeeAccountIDList: updates.map((update) => update.accountID).join(','),
        employeeLoginList: updates.map((update) => update.email).join(','),
        isOffice,
    };
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {optimisticData, successData, failureData};
    API.write(WRITE_COMMANDS.SET_EMPLOYEE_WORK_ARRANGEMENT, parameters, onyxData);
}

/**
 * Turn the "Require GPS or map entry" setting on or off for a policy. When it's on, the manual and odometer
 * distance flows are unavailable because neither can produce a mapped route.
 */
function setPolicyRequireMapOrGPS(policyID: string, requireMapOrGPS: boolean, previousRequireMapOrGPS: boolean | undefined) {
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    requireMapOrGPS,
                    pendingFields: {requireMapOrGPS: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    errorFields: {requireMapOrGPS: null},
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    pendingFields: {requireMapOrGPS: null},
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    requireMapOrGPS: previousRequireMapOrGPS ?? false,
                    pendingFields: {requireMapOrGPS: null},
                    errorFields: {requireMapOrGPS: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters: SetPolicyRequireMapOrGPSParams = {policyID, enabled: requireMapOrGPS};
    API.write(WRITE_COMMANDS.SET_POLICY_REQUIRE_MAP_OR_GPS, parameters, onyxData);
}

function clearPolicyRequireMapOrGPSErrors(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        errorFields: {requireMapOrGPS: null},
        pendingFields: {requireMapOrGPS: null},
    });
}

/**
 * Turns government rate auto-update on or off for a workspace. The rate copying, unit correction and missing `customUnit`
 * behavior are documented on buildOnyxDataForGovernmentRateAutoUpdate, which provides the Onyx data used here.
 */
function setWorkspaceDistanceAutoUpdate(
    policyID: string,
    customUnit: CustomUnit | undefined,
    shouldAutoUpdateGovernmentDistanceRates: boolean,
    governmentMileageRates: GovernmentMileageRate[],
    outputCurrency: string | undefined,
    countryCode?: string,
    previousAutoUpdateEnabled?: boolean,
    previousCountryCode?: string,
) {
    const {optimisticRateIDs, onyxData} = buildOnyxDataForGovernmentRateAutoUpdate(
        policyID,
        customUnit,
        shouldAutoUpdateGovernmentDistanceRates,
        governmentMileageRates,
        outputCurrency,
        countryCode,
        previousAutoUpdateEnabled,
        previousCountryCode,
    );

    const parameters: SetWorkspaceDistanceAutoUpdateParams = {
        policyID,
        shouldAutoUpdateGovernmentDistanceRates,
        ...(Object.keys(optimisticRateIDs).length > 0 ? {optimisticRateIDs: JSON.stringify(optimisticRateIDs)} : {}),
        ...(countryCode ? {countryCode} : {}),
    };

    API.write(WRITE_COMMANDS.SET_WORKSPACE_DISTANCE_AUTO_UPDATE, parameters, onyxData);
}

function clearWorkspaceDistanceAutoUpdateErrors(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        errorFields: {shouldAutoUpdateGovernmentDistanceRates: null},
        pendingFields: {shouldAutoUpdateGovernmentDistanceRates: null, autoUpdateGovernmentRateCountry: null},
    });
}

function clearPolicyCommuterExclusionsErrors(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        errorFields: {commuterExclusions: null},
        pendingFields: {commuterExclusions: null},
    });
}

export {
    enablePolicyDistanceRates,
    openPolicyDistanceRatesPage,
    createPolicyDistanceRate,
    clearCreateDistanceRateItemAndError,
    clearDeleteDistanceRateError,
    setPolicyDistanceRatesUnit,
    clearPolicyDistanceRatesErrorFields,
    clearPolicyDistanceRateErrorFields,
    updatePolicyDistanceRateValue,
    updatePolicyDistanceRateName,
    updatePolicyDistanceRate,
    setPolicyDistanceRatesEnabled,
    deletePolicyDistanceRates,
    updateDistanceTaxClaimableValue,
    updateDistanceTaxRate,
    setPolicyCommuterExclusions,
    setPolicyWorkArrangement,
    disablePolicyCommuterExclusions,
    clearPolicyCommuterExclusionsErrors,
    setEmployeeWorkArrangement,
    setPolicyRequireMapOrGPS,
    clearPolicyRequireMapOrGPSErrors,
    setWorkspaceDistanceAutoUpdate,
    clearWorkspaceDistanceAutoUpdateErrors,
};
