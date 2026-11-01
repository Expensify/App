import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {getImportFailedFinalModal} from '@libs/actions/ImportSpreadsheet';
import * as API from '@libs/API';
import type {UpdateWorkspaceCustomUnitParams} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {generateHexadecimalValue} from '@libs/NumberUtils';
import {goBackWhenEnableFeature} from '@libs/PolicyUtils';
import {findPolicyExpenseChatByPolicyID} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {QuickAction} from '@src/types/onyx';
import type {ImportFinalModal} from '@src/types/onyx/ImportedSpreadsheet';
import type {ErrorFields, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {NullishDeep} from 'react-native-onyx';

import lodashDeepClone from 'lodash/cloneDeep';
import Onyx from 'react-native-onyx';

type SubRateData = {
    pendingAction?: PendingAction;
    destination: string;
    subRateName: string;
    rate: number;
    currency: string;
    rateID: string;
    subRateID: string;
};

/**
 * Returns a client generated 13 character hexadecimal value for a custom unit ID
 */
function generateCustomUnitID(): string {
    return generateHexadecimalValue(13);
}

function enablePerDiem(policyID: string, enabled: boolean, customUnitID?: string, shouldGoBack?: boolean, quickAction?: QuickAction) {
    const doesCustomUnitExists = !!customUnitID;
    const finalCustomUnitID = doesCustomUnitExists ? customUnitID : generateCustomUnitID();
    const optimisticCustomUnit = {
        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
        customUnitID: finalCustomUnitID,
        enabled,
        defaultCategory: '',
        rates: {},
    };
    const workspaceChatReportID = findPolicyExpenseChatByPolicyID(policyID)?.reportID;

    const shouldClearQuickAction = quickAction?.action === CONST.QUICK_ACTIONS.PER_DIEM && !enabled && workspaceChatReportID === quickAction?.chatReportID;
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    arePerDiemRatesEnabled: enabled,
                    pendingFields: {
                        arePerDiemRatesEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    ...(doesCustomUnitExists ? {} : {customUnits: {[finalCustomUnitID]: optimisticCustomUnit}}),
                },
            },
            ...(shouldClearQuickAction
                ? [
                      {
                          onyxMethod: Onyx.METHOD.SET,
                          key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
                          value: null,
                      },
                  ]
                : []),
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        arePerDiemRatesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    arePerDiemRatesEnabled: !enabled,
                    pendingFields: {
                        arePerDiemRatesEnabled: null,
                    },
                },
            },
            ...(shouldClearQuickAction
                ? [
                      {
                          onyxMethod: Onyx.METHOD.SET,
                          key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
                          value: quickAction,
                      },
                  ]
                : []),
        ],
    };

    const parameters = {policyID, enabled, customUnitID: finalCustomUnitID};

    API.write(WRITE_COMMANDS.TOGGLE_POLICY_PER_DIEM, parameters, onyxData);

    if (enabled && getIsNarrowLayout() && shouldGoBack) {
        goBackWhenEnableFeature();
    }
}

function openPolicyPerDiemPage(policyID?: string) {
    if (!policyID) {
        return;
    }

    const params = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_PER_DIEM_RATES_PAGE, params);
}

function getImportPerDiemRatesFinalModal(ratesLength: number): ImportFinalModal {
    return {
        titleKey: 'spreadsheet.importSuccessfulTitle',
        promptKey: 'spreadsheet.importPerDiemRatesSuccessfulDescription',
        promptKeyParams: {
            count: ratesLength,
        },
    };
}

async function importPerDiemRates(policyID: string, customUnitID: string, rates: Rate[], rowsLength: number): Promise<ImportFinalModal> {
    const importFinalModal = getImportPerDiemRatesFinalModal(rowsLength);

    const parameters = {
        policyID,
        customUnitID,
        customUnitRates: JSON.stringify(rates),
    };

    try {
        // We need the server result immediately so the initiating page can show the final confirmation modal
        // without storing transient modal state in Onyx.
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.IMPORT_PER_DIEM_RATES, parameters);
        return response?.jsonCode === CONST.JSON_CODE.SUCCESS ? importFinalModal : getImportFailedFinalModal();
    } catch {
        return getImportFailedFinalModal();
    }
}

function downloadPerDiemCSV(policyID: string, onDownloadFailed: () => void, translate: LocalizedTranslate) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_PER_DIEM_CSV, {
        policyID,
    });

    const fileName = 'PerDiem.csv';

    const formData = new FormData();
    for (const [key, value] of Object.entries(finalParameters)) {
        formData.append(key, String(value));
    }

    fileDownload(translate, getCommandURL({command: WRITE_COMMANDS.EXPORT_PER_DIEM_CSV}), fileName, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

function clearPolicyPerDiemRatesErrorFields(policyID: string, customUnitID: string, updatedErrorFields: ErrorFields) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                errorFields: updatedErrorFields,
            },
        },
    });
}

function clearPerDiemRateError(policyID: string, customUnitID: string, rateID: string, subRateID?: string) {
    if (!policyID || !customUnitID || !rateID) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                rates: {
                    [rateID]: {
                        errors: null,
                        ...(subRateID ? {errorFields: {[subRateID]: null}} : {}),
                    },
                },
            },
        },
    });
}

function prepareCustomUnitRateUpdates(customUnit: CustomUnit, subRatesToBeDeleted: SubRateData[]) {
    const selectedSubRateKeys = new Set(subRatesToBeDeleted.map((subRate) => `${subRate.rateID}:${subRate.subRateID}`));
    let subRateCount = 0;
    let selectedSubRateCount = 0;
    for (const rate of Object.values(customUnit.rates)) {
        for (const subRate of rate.subRates ?? []) {
            subRateCount++;
            if (selectedSubRateKeys.has(`${rate.customUnitRateID}:${subRate.id}`)) {
                selectedSubRateCount++;
            }
        }
    }
    // Auth clears every destination when deleteAllRates is set, so filtered selections must use targeted mutations instead.
    const shouldDeleteAllRates = subRateCount > 0 && selectedSubRateCount === subRateCount;
    if (shouldDeleteAllRates) {
        const firstSelectedSubRate = subRatesToBeDeleted.at(0);
        const firstSelectedRate = firstSelectedSubRate ? customUnit.rates[firstSelectedSubRate.rateID] : undefined;
        // Restore every rate on failure, but attach one row error to avoid duplicating the same error across the full selection.
        const failureRates = {...customUnit.rates};
        if (firstSelectedSubRate && firstSelectedRate) {
            failureRates[firstSelectedSubRate.rateID] = {
                ...firstSelectedRate,
                errors: undefined,
                errorFields: {[firstSelectedSubRate.subRateID]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                pendingAction: null,
            };
        }
        return {optimisticRates: {}, failureRates, customUnitRateUpdates: {}, customUnitRateIDs: [], shouldDeleteAllRates};
    }

    const mappedDeletedSubRatesToRate = subRatesToBeDeleted.reduce(
        (acc, subRate) => {
            if (subRate.rateID in acc) {
                acc[subRate.rateID].push(subRate);
            } else {
                acc[subRate.rateID] = [subRate];
            }
            return acc;
        },
        {} as Record<string, SubRateData[]>,
    );

    const optimisticRates: Record<string, NullishDeep<Rate> | null> = {};
    const failureRates: Record<string, NullishDeep<Rate>> = {};
    const customUnitRateUpdates: Record<string, Rate> = {};
    const customUnitRateIDs: string[] = [];
    const error = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');
    for (const [rateID, subRates] of Object.entries(mappedDeletedSubRatesToRate)) {
        const currentRate = customUnit.rates[rateID];
        if (!currentRate) {
            continue;
        }
        const selectedSubRateIDs = new Set(subRates.map((subRate) => subRate.subRateID));
        const currentSubRates = currentRate.subRates ?? [];
        const affectedSubRateIDs = currentSubRates.filter((subRate) => selectedSubRateIDs.has(subRate.id)).map((subRate) => subRate.id);
        if (!affectedSubRateIDs.length) {
            continue;
        }

        failureRates[rateID] = {
            ...currentRate,
            errors: null,
            errorFields: Object.fromEntries(affectedSubRateIDs.map((subRateID) => [subRateID, error])),
            pendingAction: null,
        };
        if (affectedSubRateIDs.length === currentSubRates.length) {
            customUnitRateIDs.push(rateID);
            optimisticRates[rateID] = null;
        } else {
            const updatedRate = lodashDeepClone(currentRate);
            updatedRate.subRates = currentSubRates.filter((subRate) => !selectedSubRateIDs.has(subRate.id));
            customUnitRateUpdates[rateID] = updatedRate;
            optimisticRates[rateID] = updatedRate;
        }
    }

    return {
        optimisticRates,
        failureRates,
        customUnitRateUpdates,
        customUnitRateIDs,
        shouldDeleteAllRates,
    };
}

function prepareCustomUnitRate(rate: Rate): Rate {
    const customUnitRate = lodashDeepClone(rate);
    delete customUnitRate.pendingAction;
    delete customUnitRate.pendingFields;
    delete customUnitRate.errors;
    delete customUnitRate.errorFields;
    return customUnitRate;
}

function deleteWorkspacePerDiemRates(policyID: string, customUnit: CustomUnit | undefined, subRatesToBeDeleted: SubRateData[]) {
    if (!policyID || isEmptyObject(customUnit) || !subRatesToBeDeleted.length) {
        return;
    }
    const {optimisticRates, failureRates, customUnitRateUpdates, customUnitRateIDs, shouldDeleteAllRates} = prepareCustomUnitRateUpdates(customUnit, subRatesToBeDeleted);
    if (!shouldDeleteAllRates && !Object.keys(optimisticRates).length) {
        return;
    }
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnit.customUnitID]: {
                            rates: shouldDeleteAllRates ? null : optimisticRates,
                        },
                    },
                },
            },
        ],
        failureData: [
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
        ],
    };

    const sanitizedRateUpdates = Object.values(customUnitRateUpdates).map(prepareCustomUnitRate);
    let parameters: UpdateWorkspaceCustomUnitParams;
    if (shouldDeleteAllRates) {
        parameters = {policyID, customUnitID: customUnit.customUnitID, deleteAllRates: true};
    } else if (customUnitRateIDs.length) {
        parameters = {
            policyID,
            customUnitID: customUnit.customUnitID,
            customUnitRateIDs: JSON.stringify(customUnitRateIDs),
            ...(sanitizedRateUpdates.length ? {customUnitRateUpdates: JSON.stringify(sanitizedRateUpdates)} : {}),
        };
    } else {
        parameters = {policyID, customUnitID: customUnit.customUnitID, customUnitRateUpdates: JSON.stringify(sanitizedRateUpdates)};
    }

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}

function updateWorkspacePerDiemRate(policyID: string, customUnitID: string, currentRate: Rate, updatedRate: Rate, errorSubRateID?: string) {
    const rateID = updatedRate.customUnitRateID;
    const error = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnitID]: {
                            rates: {
                                [rateID]: {
                                    ...updatedRate,
                                    errors: null,
                                    errorFields: null,
                                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnitID]: {
                            rates: {
                                [rateID]: {
                                    errors: null,
                                    errorFields: null,
                                    pendingAction: null,
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnitID]: {
                            rates: {
                                [rateID]: {
                                    ...currentRate,
                                    errors: errorSubRateID ? null : error,
                                    errorFields: errorSubRateID ? {[errorSubRateID]: error} : null,
                                    pendingAction: null,
                                },
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        customUnitID,
        customUnitRate: JSON.stringify(prepareCustomUnitRate(updatedRate)),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}

function editPerDiemRateDestination(policyID: string, rateID: string, customUnit: CustomUnit | undefined, newDestination: string) {
    if (!policyID || !rateID || isEmptyObject(customUnit) || !newDestination) {
        return;
    }

    const currentRate = customUnit.rates[rateID];
    if (!currentRate) {
        return;
    }

    const updatedRate = lodashDeepClone(currentRate);
    updatedRate.name = newDestination;
    updateWorkspacePerDiemRate(policyID, customUnit.customUnitID, currentRate, updatedRate);
}

function editPerDiemRateSubrate(policyID: string, rateID: string, subRateID: string, customUnit: CustomUnit | undefined, newSubrate: string) {
    if (!policyID || !rateID || isEmptyObject(customUnit) || !newSubrate) {
        return;
    }

    const currentRate = customUnit.rates[rateID];
    if (!currentRate) {
        return;
    }

    const updatedRate = lodashDeepClone(currentRate);
    updatedRate.subRates = updatedRate.subRates?.map((subRate) => {
        if (subRate.id === subRateID) {
            return {...subRate, name: newSubrate};
        }
        return subRate;
    });
    updateWorkspacePerDiemRate(policyID, customUnit.customUnitID, currentRate, updatedRate, subRateID);
}

function editPerDiemRateAmount(policyID: string, rateID: string, subRateID: string, customUnit: CustomUnit | undefined, newAmount: number) {
    if (!policyID || !rateID || isEmptyObject(customUnit) || !newAmount) {
        return;
    }

    const currentRate = customUnit.rates[rateID];
    if (!currentRate) {
        return;
    }

    const updatedRate = lodashDeepClone(currentRate);
    updatedRate.subRates = updatedRate.subRates?.map((subRate) => {
        if (subRate.id === subRateID) {
            return {...subRate, rate: newAmount};
        }
        return subRate;
    });

    updateWorkspacePerDiemRate(policyID, customUnit.customUnitID, currentRate, updatedRate, subRateID);
}

function editPerDiemRateCurrency(policyID: string, rateID: string, customUnit: CustomUnit | undefined, newCurrency: string) {
    if (!policyID || !rateID || isEmptyObject(customUnit) || !newCurrency) {
        return;
    }

    const currentRate = customUnit.rates[rateID];
    if (!currentRate) {
        return;
    }

    const updatedRate = lodashDeepClone(currentRate);
    updatedRate.currency = newCurrency;
    updateWorkspacePerDiemRate(policyID, customUnit.customUnitID, currentRate, updatedRate);
}

function fetchPerDiemRates(policyID: string | undefined) {
    if (!policyID) {
        return;
    }
    const parameters = {
        policyID,
    };
    API.read(READ_COMMANDS.OPEN_DRAFT_PER_DIEM_EXPENSE, parameters);
}

export {
    generateCustomUnitID,
    enablePerDiem,
    openPolicyPerDiemPage,
    importPerDiemRates,
    downloadPerDiemCSV,
    clearPolicyPerDiemRatesErrorFields,
    clearPerDiemRateError,
    deleteWorkspacePerDiemRates,
    editPerDiemRateDestination,
    editPerDiemRateSubrate,
    editPerDiemRateAmount,
    editPerDiemRateCurrency,
    fetchPerDiemRates,
};
