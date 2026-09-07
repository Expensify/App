import {getSnapshotRemovalUpdate, hasPendingSnapshotRow} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults, Transaction} from '@src/types/onyx';

import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';

type BuildOptions = {
    type?: SearchResults['search']['type'];
    count?: number;
    reportCount?: number;
    total?: number;
    hasNoServerFigures?: boolean;
    groupCurrency?: string;
    hasNoGroupAmount?: boolean;
};

function buildTransaction(transactionID: string, reportID: string, groupAmount: number | undefined, groupCurrency: string): Transaction {
    return {
        ...createRandomTransaction(Number(transactionID)),
        transactionID,
        reportID,
        amount: groupAmount ?? -1000,
        currency: 'USD',
        groupCurrency,
        ...(groupAmount === undefined ? {} : {groupAmount}),
    };
}

/** Three expenses across two reports: report 1 holds 1000 + 2000, report 2 holds 3000. The server counted all three. */
function buildSearchResults({
    type = CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    count = 3,
    reportCount = 2,
    total = 6000,
    hasNoServerFigures = false,
    groupCurrency = 'USD',
    hasNoGroupAmount = false,
}: BuildOptions = {}): SearchResults {
    const data: SearchResults['data'] = {};
    data[`${ONYXKEYS.COLLECTION.REPORT}1`] = {...createRandomReport(1), reportID: '1', currency: 'USD'};
    data[`${ONYXKEYS.COLLECTION.REPORT}2`] = {...createRandomReport(2), reportID: '2', currency: 'USD'};
    data[`${ONYXKEYS.COLLECTION.TRANSACTION}10`] = buildTransaction('10', '1', -1000, 'USD');
    data[`${ONYXKEYS.COLLECTION.TRANSACTION}11`] = buildTransaction('11', '1', -2000, 'USD');
    data[`${ONYXKEYS.COLLECTION.TRANSACTION}20`] = buildTransaction('20', '2', hasNoGroupAmount ? undefined : -3000, groupCurrency);

    return {
        search: {
            hash: 1,
            offset: 0,
            type,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            count: hasNoServerFigures ? undefined : count,
            reportCount: hasNoServerFigures ? undefined : reportCount,
            total: hasNoServerFigures ? undefined : total,
            currency: 'USD',
        },
        data,
    };
}

describe('getSnapshotRemovalUpdate', () => {
    it('nulls the report, nulls its expenses, and takes them off the whole-search figures', () => {
        expect(getSnapshotRemovalUpdate(buildSearchResults(), ['1'])).toEqual({
            data: {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: null,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}10`]: null,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}11`]: null,
            },
            search: {count: 1, reportCount: 1, total: 3000},
        });
    });

    it('removes several reports at once', () => {
        expect(getSnapshotRemovalUpdate(buildSearchResults(), ['1', '2'])?.search).toEqual({count: 0, reportCount: 0, total: 0});
    });

    it('changes nothing for a report already gone from the snapshot, so applying it twice cannot subtract twice', () => {
        const searchResults = buildSearchResults();
        delete searchResults.data[`${ONYXKEYS.COLLECTION.REPORT}1`];

        expect(getSnapshotRemovalUpdate(searchResults, ['1'])).toBeUndefined();
    });

    it('leaves the total alone when a removed expense is in another currency, and still fixes the count', () => {
        expect(getSnapshotRemovalUpdate(buildSearchResults({groupCurrency: 'PLN'}), ['2'])?.search).toEqual({count: 2, reportCount: 1});
    });

    it('leaves the total alone when a removed expense carries no converted amount', () => {
        expect(getSnapshotRemovalUpdate(buildSearchResults({hasNoGroupAmount: true}), ['2'])?.search).toEqual({count: 2, reportCount: 1});
    });

    it('never reports a negative count', () => {
        expect(getSnapshotRemovalUpdate(buildSearchResults({count: 1, reportCount: 0}), ['1'])?.search).toEqual({count: 0, reportCount: 0, total: 3000});
    });

    it('still nulls the rows when the snapshot carries no figures to adjust', () => {
        expect(getSnapshotRemovalUpdate(buildSearchResults({hasNoServerFigures: true}), ['1'])).toEqual({
            data: {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: null,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}10`]: null,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}11`]: null,
            },
            search: {},
        });
    });

    it('returns undefined for search types whose rows are not reports', () => {
        expect(getSnapshotRemovalUpdate(buildSearchResults({type: CONST.SEARCH.DATA_TYPES.EXPENSE}), ['1'])).toBeUndefined();
    });

    it('returns undefined without results or report IDs', () => {
        expect(getSnapshotRemovalUpdate(undefined, ['1'])).toBeUndefined();
        expect(getSnapshotRemovalUpdate(buildSearchResults(), [])).toBeUndefined();
    });
});

describe('hasPendingSnapshotRow', () => {
    it('is false for a snapshot the server has confirmed', () => {
        expect(hasPendingSnapshotRow(buildSearchResults())).toBe(false);
    });

    it('is true while an optimistically added expense is still pending', () => {
        const searchResults = buildSearchResults();
        searchResults.data[`${ONYXKEYS.COLLECTION.TRANSACTION}30`] = {...buildTransaction('30', '1', -500, 'USD'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};

        expect(hasPendingSnapshotRow(searchResults)).toBe(true);
    });

    it('is true while an optimistically added report is still pending', () => {
        const searchResults = buildSearchResults();
        searchResults.data[`${ONYXKEYS.COLLECTION.REPORT}3`] = {...createRandomReport(3), reportID: '3', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};

        expect(hasPendingSnapshotRow(searchResults)).toBe(true);
    });

    it('is false without results', () => {
        expect(hasPendingSnapshotRow(undefined)).toBe(false);
    });
});
