import {renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import type {InsightsDetailsQuery} from '@pages/Insights/details/buildInsightsDetailsQuery';
import {INSIGHTS_DETAILS_SECTION_STATE} from '@pages/Insights/details/insightsDetailsSectionState';
import useInsightsTopExpenses from '@pages/Insights/details/useInsightsTopExpenses';
import {buildTopExpensesQueryJSON} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import currencyList from './currencyList.json';

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: mockIsOffline})));
let mockCurrentSearchQueryJSON: SearchQueryJSON | undefined;
jest.mock('@libs/SearchQueryUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/SearchQueryUtils'),
    getCurrentSearchQueryJSON: jest.fn(() => mockCurrentSearchQueryJSON),
}));

const QUERY = 'type:expense view:table date>=2026-01-01 date<=2026-03-31';
const TOP_EXPENSES_QUERY_JSON = buildTopExpensesQueryJSON(QUERY);
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${TOP_EXPENSES_QUERY_JSON?.hash}` as const;
const DETAILS_QUERY: InsightsDetailsQuery = {
    jsonQuery: '{}',
    hash: 1,
    topExpensesSnapshotHash: TOP_EXPENSES_QUERY_JSON?.hash ?? 0,
    period: {start: '2026-01-01', end: '2026-03-31'},
    periodGroupBy: CONST.SEARCH.GROUP_BY.QUARTER,
    isPeriodInProgress: false,
};
const DETAILS_KEY = `${ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${DETAILS_QUERY.hash}` as const;
const ACCOUNT_ID = 1;

/** Builds a snapshot with one expense report per expense, the expense with ID `n` costing `n` dollars. */
function buildSnapshotData(expenseCount: number, pendingDeleteID?: number): SearchResults['data'] {
    const data: Record<string, unknown> = {
        personalDetailsList: {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, avatar: '', displayName: 'Submitter', login: 'submitter@expensify.com'}},
    };
    for (let index = 1; index <= expenseCount; index++) {
        const id = String(index);
        data[`report_${id}`] = {
            accountID: ACCOUNT_ID,
            chatReportID: '9999',
            currency: 'USD',
            ownerAccountID: ACCOUNT_ID,
            policyID: 'A1B2C3',
            reportID: id,
            reportName: 'Expense Report',
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: -index * 100,
            type: CONST.REPORT.TYPE.EXPENSE,
        };
        data[`transactions_${id}`] = {
            amount: -index * 100,
            category: '',
            comment: {comment: ''},
            created: '2026-02-01',
            currency: 'USD',
            merchant: `Merchant ${id}`,
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            reportID: id,
            tag: '',
            transactionID: id,
            pendingAction: index === pendingDeleteID ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the rows only carry the fields the list reads, not the full Transaction/Report shapes
    return data as SearchResults['data'];
}

/** Returns the `search` metadata a response for the Top expenses query stores. */
function buildSearchMetadata() {
    return {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        offset: 0,
        hash: TOP_EXPENSES_QUERY_JSON?.hash,
        sortBy: TOP_EXPENSES_QUERY_JSON?.sortBy,
        sortOrder: TOP_EXPENSES_QUERY_JSON?.sortOrder,
        state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
        isLoading: false,
        hasMoreResults: false,
    };
}

function renderTopExpenses(query: string) {
    return renderHook((props: {query: string}) => useInsightsTopExpenses(props.query, DETAILS_QUERY), {
        initialProps: {query},
        wrapper: ({children}) => <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>{children}</ComposeProviders>,
    });
}

describe('useInsightsTopExpenses', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        mockIsOffline = false;
        mockCurrentSearchQueryJSON = undefined;
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'submitter@expensify.com'});
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    describe('state', () => {
        it('is loading until the response arrives', async () => {
            // Given no stored response for the query
            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it shows the skeleton with no rows
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.LOADING);
            expect(result.current.expenses).toEqual([]);
        });

        it('lists at most 10 expenses, largest first, without pending deletions', async () => {
            // Given a response holding more than 10 expenses, the 11 dollar one being deleted offline
            await Onyx.set(SNAPSHOT_KEY, {data: buildSnapshotData(12, 11), search: buildSearchMetadata()});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it lists the 10 largest remaining expenses in order, since optimistic writes can add rows beyond the limit
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.READY);
            expect(result.current.expenses.map((expense) => expense.transactionID)).toEqual(['12', '10', '9', '8', '7', '6', '5', '4', '3', '2']);
        });

        it('lists expenses the Spend tab filters out, since it filters by its own query', async () => {
            // Given the Spend tab last showed paid expenses only, and a response holding unpaid ones
            mockCurrentSearchQueryJSON = buildSearchQueryJSON('type:expense status:paid');
            await Onyx.set(SNAPSHOT_KEY, {data: buildSnapshotData(2), search: buildSearchMetadata()});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it still lists them, since the Spend tab's filters don't apply to this query
            expect(result.current.expenses.map((expense) => expense.transactionID)).toEqual(['2', '1']);
        });

        it('is stale when the request got no response', async () => {
            // Given a request that failed without reaching the server
            await Onyx.set(DETAILS_KEY, {errors: {error: 'No response'}, responseJsonCode: CONST.JSON_CODE.NO_RESPONSE});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it asks the user to refresh rather than reporting an error
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.STALE);
        });

        it('is an error when the server rejected the request', async () => {
            // Given a request the server answered with an error
            await Onyx.set(DETAILS_KEY, {errors: {error: 'Server error'}, responseJsonCode: CONST.JSON_CODE.EXP_ERROR});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it shows the error state
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.ERROR);
        });

        it('is offline when offline and nothing is stored for the query', async () => {
            // Given the device is offline and the query was never loaded
            mockIsOffline = true;

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it shows the offline state instead of a skeleton that would never resolve
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.OFFLINE);
        });

        it('keeps showing stored expenses while offline', async () => {
            // Given the device is offline but the query was loaded before
            mockIsOffline = true;
            await Onyx.set(SNAPSHOT_KEY, {data: buildSnapshotData(2), search: buildSearchMetadata()});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then the stored expenses stay visible, since they are still accurate as of the last load
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.READY);
            expect(result.current.expenses.map((expense) => expense.transactionID)).toEqual(['2', '1']);
        });
    });
});
