import type {NullishDeep, OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import fileDownload from '@libs/fileDownload';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {translateLocal} from '@libs/Localize';
import enhanceParameters from '@libs/Network/enhanceParameters';
import * as NumberUtils from '@libs/NumberUtils';
import {navigateWhenEnableFeature} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {Rate} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

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
 * Returns a client generated 13 character hexadecimal value for a custom unit ID
 */
function generateCustomUnitID(): string {
    return NumberUtils.generateHexadecimalValue(13);
}

function enablePerDiem(policyID: string, enabled: boolean, customUnitID?: string) {
    const doesCustomUnitExists = !!customUnitID;
    const finalCustomUnitID = doesCustomUnitExists ? customUnitID : generateCustomUnitID();
    const optimisticCustomUnit = {
        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
        customUnitID: finalCustomUnitID,
        enabled: true,
        defaultCategory: '',
        rates: {},
    };
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
        ],
    };

    const parameters = {policyID, enabled, customUnitID: finalCustomUnitID};

    API.write(WRITE_COMMANDS.TOGGLE_POLICY_PER_DIEM, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
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
                        title: translateLocal('spreadsheet.importSuccessfullTitle'),
                        prompt: translateLocal('spreadsheet.importPerDiemRatesSuccessfullDescription', {rates: ratesLength}),
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
                    importFinalModal: {title: translateLocal('spreadsheet.importFailedTitle'), prompt: translateLocal('spreadsheet.importFailedDescription')},
                },
            },
        ],
    };

    return onyxData;
}

function importPerDiemRates(policyID: string, customUnitID: string, rates: Rate[]) {
    const onyxData = updateImportSpreadsheetData(rates.length);

    const parameters = {
        policyID,
        customUnitID,
        customUnitRates: JSON.stringify(rates),
    };

    API.write(WRITE_COMMANDS.IMPORT_PER_DIEM_RATES, parameters, onyxData);
}

function downloadPerDiemCSV(policyID: string, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_PER_DIEM_CSV, {
        policyID,
    });

    const fileName = 'PerDiem.csv';

    const formData = new FormData();
    Object.entries(finalParameters).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    fileDownload(ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_PER_DIEM_CSV}), fileName, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

export {generateCustomUnitID, enablePerDiem, openPolicyPerDiemPage, importPerDiemRates, downloadPerDiemCSV};
