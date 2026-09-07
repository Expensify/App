import {getSearchTotalsAfterLocalRemovals} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults, Transaction} from '@src/types/onyx';

import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';

type BuildOptions = {
    /** Reports whose entry was removed from the snapshot, leaving their expenses orphaned */
    removedReportIDs?: string[];
    type?: SearchResults['search']['type'];
    count?: number;
    total?: number;
    hasNoServerFigures?: boolean;
    groupCurrency?: string;
    hasNoGroupAmount?: boolean;
    hasMoreResults?: boolean;
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
    removedReportIDs = [],
    type = CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    count = 3,
    total = 6000,
    groupCurrency = 'USD',
    hasNoGroupAmount = false,
    hasMoreResults = false,
    hasNoServerFigures = false,
}: BuildOptions = {}): SearchResults {
    const data: SearchResults['data'] = {};
    data[`${ONYXKEYS.COLLECTION.TRANSACTION}10`] = buildTransaction('10', '1', -1000, 'USD');
    data[`${ONYXKEYS.COLLECTION.TRANSACTION}11`] = buildTransaction('11', '1', -2000, 'USD');
    data[`${ONYXKEYS.COLLECTION.TRANSACTION}20`] = buildTransaction('20', '2', hasNoGroupAmount ? undefined : -3000, groupCurrency);

    for (const reportID of ['1', '2']) {
        if (removedReportIDs.includes(reportID)) {
            continue;
        }
        data[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {...createRandomReport(Number(reportID)), reportID, currency: 'USD'};
    }

    return {
        search: {
            hash: 1,
            offset: 0,
            type,
            hasMoreResults,
            hasResults: true,
            isLoading: false,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            count: hasNoServerFigures ? undefined : count,
            total: hasNoServerFigures ? undefined : total,
            currency: 'USD',
        },
        data,
    };
}

describe('getSearchTotalsAfterLocalRemovals', () => {
    it('returns undefined while no row has been removed, so the server figures stand', () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults(), 'USD')).toBeUndefined();
    });

    it("subtracts a removed report's expenses from the count and the total", () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults({removedReportIDs: ['1']}), 'USD')).toEqual({count: 1, total: 3000});
    });

    it('subtracts every removed report, not just the last one', () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults({removedReportIDs: ['1', '2']}), 'USD')).toEqual({count: 0, total: 0});
    });

    it('still subtracts on a paginated search, where the snapshot holds only part of the result set', () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults({removedReportIDs: ['1'], count: 120, total: 240000, hasMoreResults: true}), 'USD')).toEqual({
            count: 118,
            total: 237000,
        });
    });

    it('keeps the server total but still fixes the count when a removed expense is in another currency', () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults({removedReportIDs: ['2'], groupCurrency: 'PLN'}), 'USD')).toEqual({count: 2, total: 6000});
    });

    it('keeps the server total but still fixes the count when a removed expense carries no converted amount', () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults({removedReportIDs: ['2'], hasNoGroupAmount: true}), 'USD')).toEqual({count: 2, total: 6000});
    });

    it('never reports a negative count', () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults({removedReportIDs: ['1'], count: 1}), 'USD')).toEqual({count: 0, total: 3000});
    });

    it('leaves a missing count or total missing', () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults({removedReportIDs: ['1'], hasNoServerFigures: true}), 'USD')).toEqual({count: undefined, total: undefined});
    });

    it('returns undefined for search types whose rows are not reports', () => {
        expect(getSearchTotalsAfterLocalRemovals(buildSearchResults({removedReportIDs: ['1'], type: CONST.SEARCH.DATA_TYPES.EXPENSE}), 'USD')).toBeUndefined();
    });

    it('returns undefined without results', () => {
        expect(getSearchTotalsAfterLocalRemovals(undefined, 'USD')).toBeUndefined();
    });
});
