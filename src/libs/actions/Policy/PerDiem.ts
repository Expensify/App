import lodashDeepClone from 'lodash/cloneDeep';
import type {NullishDeep} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import fileDownload from '@libs/fileDownload';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {generateHexadecimalValue} from '@libs/NumberUtils';
import {goBackWhenEnableFeature} from '@libs/PolicyUtils';
import {findPolicyExpenseChatByPolicyID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {QuickAction} from '@src/types/onyx';
import type {ErrorFields, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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
        enabled: true,
        defaultCategory: '',
        rates: {},
    };
    const workspaceChatReportID = findPolicyExpenseChatByPolicyID(policyID)?.reportID;

    const shouldClearQuickAction = quickAction?.action === CONST.QUICK_ACTIONS.PER_DIEM && !enabled && workspaceChatReportID === quickAction?.chatReportID;
    const onyxData: OnyxData = {
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
        goBackWhenEnableFeature(policyID);
    }
}

function openPolicyPerDiemPage(policyID?: string) {
    if (!policyID) {
        return;
    }

    const params = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_PER_DIEM_RATES_PAGE, params);
}

function updateImportSpreadsheetData(ratesLength: number) {
    const onyxData: OnyxData = {
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        titleKey: 'spreadsheet.importSuccessfulTitle',
                        promptKey: 'spreadsheet.importPerDiemRatesSuccessfulDescription',
                        promptKeyParams: {
                            rates: ratesLength,
                        },
                    },
                },
            },
        ],

        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        titleKey: 'spreadsheet.importFailedTitle',
                        promptKey: 'spreadsheet.importFailedDescription',
                    },
                },
            },
        ],
    };

    return onyxData;
}

function importPerDiemRates(policyID: string, customUnitID: string, rates: Rate[], rowsLength: number) {
    const onyxData = updateImportSpreadsheetData(rowsLength);

    const parameters = {
        policyID,
        customUnitID,
        customUnitRates: JSON.stringify(rates),
    };

    API.write(WRITE_COMMANDS.IMPORT_PER_DIEM_RATES, parameters, onyxData);
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

type DeletePerDiemCustomUnitOnyxType = Omit<CustomUnit, 'rates'> & {
    rates: Record<string, NullishDeep<Rate> | null>;
};

function prepareNewCustomUnit(customUnit: CustomUnit, subRatesToBeDeleted: SubRateData[]) {
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

    // Copy the custom unit and remove the sub rates that are to be deleted
    const newCustomUnit: CustomUnit = lodashDeepClone(customUnit);
    const customUnitOnyxUpdate: DeletePerDiemCustomUnitOnyxType = lodashDeepClone(customUnit);
    for (const rateID in mappedDeletedSubRatesToRate) {
        if (!(rateID in newCustomUnit.rates)) {
            continue;
        }
        const subRates = mappedDeletedSubRatesToRate[rateID];
        if (subRates.length === newCustomUnit.rates[rateID].subRates?.length) {
            delete newCustomUnit.rates[rateID];
            customUnitOnyxUpdate.rates[rateID] = null;
        } else {
            const newSubRates = newCustomUnit.rates[rateID].subRates?.filter((subRate) => !subRates.some((subRateToBeDeleted) => subRateToBeDeleted.subRateID === subRate.id));
            newCustomUnit.rates[rateID].subRates = newSubRates;
            customUnitOnyxUpdate.rates[rateID] = {...customUnitOnyxUpdate.rates[rateID], subRates: newSubRates};
        }
    }
    return {newCustomUnit, customUnitOnyxUpdate};
}

function deleteWorkspacePerDiemRates(policyID: string, customUnit: CustomUnit | undefined, subRatesToBeDeleted: SubRateData[]) {
    if (!policyID || isEmptyObject(customUnit) || !subRatesToBeDeleted.length) {
        return;
    }
    const {newCustomUnit, customUnitOnyxUpdate} = prepareNewCustomUnit(customUnit, subRatesToBeDeleted);
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnit.customUnitID]: customUnitOnyxUpdate,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}

function editPerDiemRateDestination(policyID: string, rateID: string, customUnit: CustomUnit | undefined, newDestination: string) {
    if (!policyID || !rateID || isEmptyObject(customUnit) || !newDestination) {
        return;
    }

    const newCustomUnit: CustomUnit = lodashDeepClone(customUnit);
    newCustomUnit.rates[rateID].name = newDestination;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnit.customUnitID]: newCustomUnit,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}

function editPerDiemRateSubrate(policyID: string, rateID: string, subRateID: string, customUnit: CustomUnit | undefined, newSubrate: string) {
    if (!policyID || !rateID || isEmptyObject(customUnit) || !newSubrate) {
        return;
    }

    const newCustomUnit: CustomUnit = lodashDeepClone(customUnit);
    newCustomUnit.rates[rateID].subRates = newCustomUnit.rates[rateID].subRates?.map((subRate) => {
        if (subRate.id === subRateID) {
            return {...subRate, name: newSubrate};
        }
        return subRate;
    });

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnit.customUnitID]: newCustomUnit,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}

function editPerDiemRateAmount(policyID: string, rateID: string, subRateID: string, customUnit: CustomUnit | undefined, newAmount: number) {
    if (!policyID || !rateID || isEmptyObject(customUnit) || !newAmount) {
        return;
    }

    const newCustomUnit: CustomUnit = lodashDeepClone(customUnit);
    newCustomUnit.rates[rateID].subRates = newCustomUnit.rates[rateID].subRates?.map((subRate) => {
        if (subRate.id === subRateID) {
            return {...subRate, rate: newAmount};
        }
        return subRate;
    });

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnit.customUnitID]: newCustomUnit,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}

function editPerDiemRateCurrency(policyID: string, rateID: string, customUnit: CustomUnit | undefined, newCurrency: string) {
    if (!policyID || !rateID || isEmptyObject(customUnit) || !newCurrency) {
        return;
    }

    const newCustomUnit: CustomUnit = lodashDeepClone(customUnit);
    newCustomUnit.rates[rateID].currency = newCurrency;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnit.customUnitID]: newCustomUnit,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
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
    deleteWorkspacePerDiemRates,
    editPerDiemRateDestination,
    editPerDiemRateSubrate,
    editPerDiemRateAmount,
    editPerDiemRateCurrency,
    fetchPerDiemRates,
};
