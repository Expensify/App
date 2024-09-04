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
import {navigateWhenEnableFeature, removePendingFieldsFromCustomUnit} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';
import type {Attributes, CustomUnit, Rate} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

type NewCustomUnit = {
    customUnitID: string;
    name: string;
    attributes: Attributes;
    rates: Rate;
};

const allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            const policyID = key.replace(ONYXKEYS.COLLECTION.POLICY, '');
            const policyReports = ReportUtils.getAllPolicyReports(policyID);
            const cleanUpMergeQueries: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, NullishDeep<Report>> = {};
            const cleanUpSetQueries: Record<`${typeof ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${string}` | `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${string}`, null> = {};
            policyReports.forEach((policyReport) => {
                if (!policyReport) {
                    return;
                }
                const {reportID} = policyReport;
                cleanUpSetQueries[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] = null;
                cleanUpSetQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`] = null;
            });
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, cleanUpMergeQueries);
            Onyx.multiSet(cleanUpSetQueries);
            delete allPolicies[key];
            return;
        }

        allPolicies[key] = val;
    },
});

/**
 * Takes array of customUnitRates and removes pendingFields and errorFields from each rate - we don't want to send those via API
 */
function prepareCustomUnitRatesArray(customUnitRates: Rate[]): Rate[] {
    const customUnitRateArray: Rate[] = [];
    customUnitRates.forEach((rate) => {
        const cleanedRate = {...rate};
        delete cleanedRate.pendingFields;
        delete cleanedRate.errorFields;
        customUnitRateArray.push(cleanedRate);
    });

    return customUnitRateArray;
}

function openPolicyDistanceRatesPage(policyID?: string) {
    if (!policyID) {
        return;
    }

    const params: OpenPolicyDistanceRatesPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_DISTANCE_RATES_PAGE, params);
}

function enablePolicyDistanceRates(policyID: string, enabled: boolean) {
    const onyxData: OnyxData = {
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

    if (!enabled) {
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        const customUnitID = Object.keys(policy?.customUnits ?? {})[0];
        const customUnit = customUnitID ? policy?.customUnits?.[customUnitID] : undefined;

        const rateEntries = Object.entries(customUnit?.rates ?? {});
        // find the rate to be enabled after disabling the distance rate feature
        const rateEntryToBeEnabled = rateEntries[0];

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
                                        enabled: rateID === rateEntryToBeEnabled[0],
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

    API.write(WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
    }
}

function createPolicyDistanceRate(policyID: string, customUnitID: string, customUnitRate: Rate) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID ?? '']: {
                                ...customUnitRate,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID ?? '']: {
                                pendingAction: null,
                            },
                        },
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
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID ?? '']: {
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
    const optimisticData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
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
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Rate> = {};
    const successRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};
    const rateIDs = customUnitRates.map((rate) => rate.customUnitRateID);

    for (const rateID of Object.keys(customUnit.rates)) {
        if (rateIDs.includes(rateID)) {
            const foundRate = customUnitRates.find((rate) => rate.customUnitRateID === rateID);
            optimisticRates[rateID] = {...foundRate, pendingFields: {rate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}};
            successRates[rateID] = {...foundRate, pendingFields: {rate: null}};
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {rate: null},
                errorFields: {rate: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            };
        }
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

    const successData: OnyxUpdate[] = [
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

    const params: UpdatePolicyDistanceRateValueParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_VALUE, params, {optimisticData, successData, failureData});
}

function setPolicyDistanceRatesEnabled(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Rate> = {};
    const successRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};
    const rateIDs = customUnitRates.map((rate) => rate.customUnitRateID);

    for (const rateID of Object.keys(currentRates)) {
        if (rateIDs.includes(rateID)) {
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

    const successData: OnyxUpdate[] = [
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

    const params: SetPolicyDistanceRatesEnabledParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_ENABLED, params, {optimisticData, successData, failureData});
}

function deletePolicyDistanceRates(policyID: string, customUnit: CustomUnit, rateIDsToDelete: string[]) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Rate> = {};
    const successRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};

    for (const rateID of Object.keys(currentRates)) {
        if (rateIDsToDelete.includes(rateID)) {
            optimisticRates[rateID] = {
                ...currentRates[rateID],
                enabled: false,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingAction: null,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            };
        } else {
            optimisticRates[rateID] = currentRates[rateID];
            successRates[rateID] = currentRates[rateID];
        }
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

    const successData: OnyxUpdate[] = [
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

    const params: DeletePolicyDistanceRatesParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateID: rateIDsToDelete,
    };

    API.write(WRITE_COMMANDS.DELETE_POLICY_DISTANCE_RATES, params, {optimisticData, successData, failureData});
}

function updateDistanceTaxClaimableValue(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Rate> = {};
    const successRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};
    const rateIDs = customUnitRates.map((rate) => rate.customUnitRateID);

    for (const rateID of Object.keys(customUnit.rates)) {
        if (rateIDs.includes(rateID)) {
            const foundRate = customUnitRates.find((rate) => rate.customUnitRateID === rateID);
            optimisticRates[rateID] = {...foundRate, pendingFields: {taxClaimablePercentage: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}};
            successRates[rateID] = {...foundRate, pendingFields: {taxClaimablePercentage: null}};
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {taxClaimablePercentage: null},
                errorFields: {taxClaimablePercentage: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            };
        }
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

    const successData: OnyxUpdate[] = [
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

    const params: UpdatePolicyDistanceRateValueParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE, params, {optimisticData, successData, failureData});
}

function updateDistanceTaxRate(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Rate> = {};
    const successRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};
    const rateIDs = customUnitRates.map((rate) => rate.customUnitRateID);

    for (const rateID of Object.keys(customUnit.rates)) {
        if (rateIDs.includes(rateID)) {
            const foundRate = customUnitRates.find((rate) => rate.customUnitRateID === rateID);
            optimisticRates[rateID] = {...foundRate, pendingFields: {taxRateExternalID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}};
            successRates[rateID] = {...foundRate, pendingFields: {taxRateExternalID: null}};
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {taxRateExternalID: null},
                errorFields: {taxRateExternalID: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            };
        }
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

    const successData: OnyxUpdate[] = [
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
    setPolicyDistanceRatesEnabled,
    deletePolicyDistanceRates,
    updateDistanceTaxClaimableValue,
    updateDistanceTaxRate,
};

export type {NewCustomUnit};
