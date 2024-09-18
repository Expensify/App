import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {FormOnyxValues} from '@components/Form/types';
import type {SearchQueryJSON} from '@components/Search/types';
import * as API from '@libs/API';
import type {ExportSearchItemsToCSVParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import DateUtils from '@libs/DateUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import enhanceParameters from '@libs/Network/enhanceParameters';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {ReportAction} from '@src/types/onyx';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';
import * as Report from './Report';

let currentUserEmail: string;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? '';
    },
});

function getOnyxLoadingData(hash: number): {optimisticData: OnyxUpdate[]; finallyData: OnyxUpdate[]} {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                search: {
                    isLoading: true,
                },
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                search: {
                    isLoading: false,
                },
            },
        },
    ];

    return {optimisticData, finallyData};
}

function saveSearch({queryJSON, name}: {queryJSON: SearchQueryJSON; name?: string}) {
    const saveSearchName = name ?? queryJSON?.inputQuery ?? '';
    const jsonQuery = JSON.stringify(queryJSON);

    API.write(WRITE_COMMANDS.SAVE_SEARCH, {jsonQuery, name: saveSearchName});
}

function deleteSavedSearch(hash: number) {
    API.write(WRITE_COMMANDS.DELETE_SAVED_SEARCH, {hash});
}

function search({queryJSON, offset}: {queryJSON: SearchQueryJSON; offset?: number}) {
    const {optimisticData, finallyData} = getOnyxLoadingData(queryJSON.hash);
    const {flatFilters, ...queryJSONWithoutFlatFilters} = queryJSON;
    const queryWithOffset = {
        ...queryJSONWithoutFlatFilters,
        offset,
    };
    const jsonQuery = JSON.stringify(queryWithOffset);

    API.read(READ_COMMANDS.SEARCH, {hash: queryJSON.hash, jsonQuery}, {optimisticData, finallyData});
}

/**
 * It's possible that we return legacy transactions that don't have a transaction thread created yet.
 * In that case, when users select the search result row, we need to create the transaction thread on the fly and update the search result with the new transactionThreadReport
 */
function createTransactionThread(hash: number, transactionID: string, reportID: string, moneyRequestReportActionID: string) {
    Report.openReport(reportID, '', [currentUserEmail], undefined, moneyRequestReportActionID);

    const onyxUpdate: Record<string, Record<string, Partial<SearchTransaction>>> = {
        data: {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                transactionThreadReportID: reportID,
            },
        },
    };
    Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, onyxUpdate);
}

function holdMoneyRequestOnSearch(hash: number, transactionIDList: string[], comment: string, reportID?: string) {
    const currentTime = DateUtils.getDBTime();
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);
    const createdReportAction = ReportUtils.buildOptimisticHoldReportAction(currentTime);
    const createdReportActionComment = ReportUtils.buildOptimisticHoldReportActionComment(comment, DateUtils.addMillisecondsFromDateTime(currentTime, 1));
    const successData = finallyData;
    const failureData = finallyData;
    if (reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDList[0]}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                comment: {
                    hold: CONST.POLICY.ID_FAKE,
                },
            },
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [createdReportAction.reportActionID]: createdReportAction as ReportAction,
                [createdReportActionComment.reportActionID]: createdReportActionComment as ReportAction,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDList[0]}`,
            value: {
                pendingAction: null,
                comment: {
                    hold: null,
                },
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericHoldExpenseFailureMessage'),
            },
        });
    }

    API.write(WRITE_COMMANDS.HOLD_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList, comment}, {optimisticData, successData, failureData});
}

function unholdMoneyRequestOnSearch(hash: number, transactionIDList: string[], reportID?: string) {
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);
    const createdReportAction = ReportUtils.buildOptimisticUnHoldReportAction();
    const successData = finallyData;
    const failureData = finallyData;
    if (reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDList[0]}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                comment: {
                    hold: null,
                },
            },
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [createdReportAction.reportActionID]: createdReportAction as ReportAction,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDList[0]}`,
            value: {
                pendingAction: null,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericUnholdExpenseFailureMessage'),
            },
        });
    }

    API.write(WRITE_COMMANDS.UNHOLD_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList}, {optimisticData, successData, failureData});
}

function deleteMoneyRequestOnSearch(hash: number, transactionIDList: string[]) {
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList}, {optimisticData, finallyData});
}

type Params = Record<string, ExportSearchItemsToCSVParams>;

function exportSearchItemsToCSV({query, jsonQuery, reportIDList, transactionIDList, policyIDs}: ExportSearchItemsToCSVParams, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV, {
        query,
        jsonQuery,
        reportIDList,
        transactionIDList,
        policyIDs,
    }) as Params;

    const formData = new FormData();
    Object.entries(finalParameters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            formData.append(key, value.join(','));
        } else {
            formData.append(key, String(value));
        }
    });

    fileDownload(ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV}), 'Expensify.csv', '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

/**
 * Updates the form values for the advanced filters search form.
 */
function updateAdvancedFilters(values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) {
    Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
}

/**
 * Clears all values for the advanced filters search form.
 */
function clearAllFilters() {
    Onyx.set(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, null);
}

function clearAdvancedFilters() {
    const values: Partial<Record<ValueOf<typeof FILTER_KEYS>, null>> = {};
    Object.values(FILTER_KEYS)
        .filter((key) => key !== FILTER_KEYS.TYPE && key !== FILTER_KEYS.STATUS)
        .forEach((key) => {
            values[key] = null;
        });

    Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
}

function dismissSavedSearchRenameTooltip() {
    Onyx.merge(ONYXKEYS.NVP_SHOULD_HIDE_SAVED_SEARCH_RENAME_TOOLTIP, true);
}

export {
    saveSearch,
    search,
    createTransactionThread,
    deleteMoneyRequestOnSearch,
    holdMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    updateAdvancedFilters,
    clearAllFilters,
    clearAdvancedFilters,
    deleteSavedSearch,
    dismissSavedSearchRenameTooltip,
};
