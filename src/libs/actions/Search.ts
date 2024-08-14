import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {FormOnyxValues} from '@components/Form/types';
import type {SearchQueryJSON} from '@components/Search/types';
import * as API from '@libs/API';
import type {ExportSearchItemsToCSVParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import fileDownload from '@libs/fileDownload';
import enhanceParameters from '@libs/Network/enhanceParameters';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

function search({queryJSON, offset, policyIDs}: {queryJSON: SearchQueryJSON; offset?: number; policyIDs?: string}) {
    const {optimisticData, finallyData} = getOnyxLoadingData(queryJSON.hash);

    const queryWithOffset = {
        ...queryJSON,
        offset,
    };
    const jsonQuery = JSON.stringify(queryWithOffset);

    API.read(READ_COMMANDS.SEARCH, {hash: queryJSON.hash, jsonQuery, policyIDs}, {optimisticData, finallyData});
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

function exportSearchItemsToCSV({query, reportIDList, transactionIDList, policyIDs}: ExportSearchItemsToCSVParams, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV, {
        query,
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
function clearAdvancedFilters() {
    Onyx.set(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, null);
}

export {
    search,
    createTransactionThread,
    deleteMoneyRequestOnSearch,
    holdMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    updateAdvancedFilters,
    clearAdvancedFilters,
};
