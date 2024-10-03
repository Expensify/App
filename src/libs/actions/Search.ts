import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {FormOnyxValues} from '@components/Form/types';
import type {SearchQueryJSON} from '@components/Search/types';
import * as API from '@libs/API';
import type {ExportSearchItemsToCSVParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import fileDownload from '@libs/fileDownload';
import enhanceParameters from '@libs/Network/enhanceParameters';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
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

function saveSearch({queryJSON, newName}: {queryJSON: SearchQueryJSON; newName?: string}) {
    const saveSearchName = newName ?? queryJSON?.inputQuery ?? '';
    const jsonQuery = JSON.stringify(queryJSON);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SAVED_SEARCHES,
            value: {
                [queryJSON.hash]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    name: saveSearchName,
                    query: queryJSON.inputQuery,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SAVED_SEARCHES,
            value: {
                [queryJSON.hash]: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SAVED_SEARCHES,
            value: {
                [queryJSON.hash]: {
                    pendingAction: null,
                },
            },
        },
    ];
    API.write(WRITE_COMMANDS.SAVE_SEARCH, {jsonQuery, newName: saveSearchName}, {optimisticData, failureData, successData});
}

function deleteSavedSearch(hash: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SAVED_SEARCHES,
            value: {
                [hash]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SAVED_SEARCHES,
            value: {
                [hash]: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SAVED_SEARCHES,
            value: {
                [hash]: {
                    pendingAction: null,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_SAVED_SEARCH, {hash}, {optimisticData, failureData, successData});
}

function search({queryJSON, offset}: {queryJSON: SearchQueryJSON; offset?: number}) {
    const {optimisticData, finallyData} = getOnyxLoadingData(queryJSON.hash);
    const {flatFilters, ...queryJSONWithoutFlatFilters} = queryJSON;
    const queryWithOffset = {
        ...queryJSONWithoutFlatFilters,
        offset,
    };
    const jsonQuery = JSON.stringify(queryWithOffset);

    API.write(WRITE_COMMANDS.SEARCH, {hash: queryJSON.hash, jsonQuery}, {optimisticData, finallyData});
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

function holdMoneyRequestOnSearch(hash: number, transactionIDList: string[], comment: string) {
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);

    API.write(WRITE_COMMANDS.HOLD_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList, comment}, {optimisticData, finallyData});
}

function unholdMoneyRequestOnSearch(hash: number, transactionIDList: string[]) {
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);

    API.write(WRITE_COMMANDS.UNHOLD_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList}, {optimisticData, finallyData});
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

function showSavedSearchRenameTooltip() {
    Onyx.set(ONYXKEYS.SHOULD_SHOW_SAVED_SEARCH_RENAME_TOOLTIP, true);
}

function dismissSavedSearchRenameTooltip() {
    Onyx.set(ONYXKEYS.SHOULD_SHOW_SAVED_SEARCH_RENAME_TOOLTIP, false);
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
    showSavedSearchRenameTooltip,
};
