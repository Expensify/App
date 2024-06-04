import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import ROUTES from '@src/ROUTES';
import type {SearchParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import * as ReportActions from './Report';

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

function createTransactionThread(hash: number, query: string, transactionID: string, moneyRequestReportActionID: string) {
    const newTransactionThreadReportID = ReportUtils.generateReportID();
    ReportActions.openReport(newTransactionThreadReportID, '', ['cc2@cc.com'], {}, moneyRequestReportActionID);
    Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(query, newTransactionThreadReportID));
}

export {
    // eslint-disable-next-line import/prefer-default-export
    search,
    createTransactionThread,
};
