import type {NullishDeep, OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    CreatePolicyDistanceRateParams,
    DeletePolicyDistanceRatesParams,
    EnablePolicyDistanceRatesParams,
    OpenPolicyDistanceRatesPageParams,
    SetPolicyDistanceRatesEnabledParams,
    SetPolicyDistanceRatesUnitParams,
    UpdatePolicyDistanceRateValueParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {buildOnyxDataForPolicyDistanceRateUpdates} from '@libs/PolicyDistanceRatesUtils';
import {goBackWhenEnableFeature, removePendingFieldsFromCustomUnit} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

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
        goBackWhenEnableFeature(policyID);
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

    const optimisticData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
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
            return;
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
    setPolicyDistanceRatesEnabled,
    deletePolicyDistanceRates,
    updateDistanceTaxClaimableValue,
    updateDistanceTaxRate,
};
