import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {SearchParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
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

function search({hash, query, policyIDs, offset, sortBy, sortOrder}: SearchParams) {
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

    API.read(READ_COMMANDS.SEARCH, {hash, query, offset, policyIDs, sortBy, sortOrder}, {optimisticData, finallyData});
}

/**
 * It's possible that we return legacy transactions that don't have a transaction thread created yet.
 * In that case, when users select the search result row, we need to create the transaction thread on the fly and update the search result with the new transactionThreadReport
 */
function createTransactionThread(hash: number, transactionID: string, reportID: string, moneyRequestReportActionID: string) {
    Report.openReport(reportID, '', [currentUserEmail], {}, moneyRequestReportActionID);

    const onyxUpdate: Record<string, Record<string, Partial<SearchTransaction>>> = {
        data: {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                transactionThreadReportID: reportID,
            },
        },
    };
    Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, onyxUpdate);
}

// Todo finalize the action methods and api calls
function payMoneyRequest(searchHash: string, reportsAndAmounts: Record<string, number>) {
    const optimisticData = {
        onyxMethod: 'merge',
        key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`,
        value: {isLoading: true},
    };
    const finallyData = {
        onyxMethod: 'merge',
        key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`,
        value: {isLoading: false},
    };

    API.write('Request', {paymentType, reportsAndAmounts}, {optimisticData, finallyData});
}

function approveMoneyRequest() {}
function holdMoneyRequest() {}
function submitMoneyRequest() {}

export {search, createTransactionThread, payMoneyRequest, approveMoneyRequest, holdMoneyRequest, submitMoneyRequest};
