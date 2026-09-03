/**
 * Cover/reveal contract of the Recently added fetch hook once the Home tab sits under `ScreenActivityWrapper`:
 *   - the mount fetch fires once
 *   - a hide issues no fetch and a reveal re-fires the fetch exactly once, the request a tab focus fires today
 *   - an account change or a reconnect that happens behind the cover folds into that single reveal fetch
 *   - an unfocused screen never fetches
 *   - the just-created expense held in state survives the hide
 */
import type {SearchQueryJSON} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';

import {search} from '@libs/actions/Search';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import type {RecentlyAddedExpense} from '@pages/home/RecentlyAddedSection/useRecentlyAddedData';
import {useRecentlyAddedData} from '@pages/home/RecentlyAddedSection/useRecentlyAddedData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

import createMock from '../../utils/createMock';
import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

const ACCOUNT_ID = 12345;
const OTHER_ACCOUNT_ID = 67890;
const SNAPSHOT_HASH = 1;
/** A second hash, so a change of account resolves to a different snapshot key. */
const OTHER_SNAPSHOT_HASH = 2;
const OWNED_REPORT_ID = 'report_owned';

// Module mocks

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`})),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: jest.fn(() => ({isOffline: false})),
}));

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
    createNavigationContainerRef: () => ({}),
}));

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
}));

// Deterministic query/hash so the hook reads a known snapshot key.
jest.mock('@libs/SearchQueryUtils', () => ({
    buildQueryStringFromFilterFormValues: jest.fn(() => `type:expense from:${ACCOUNT_ID}`),
    buildSearchQueryJSON: jest.fn(() => ({hash: SNAPSHOT_HASH})),
}));

const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseNetwork = jest.mocked(useNetwork);
const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockedSearch = jest.mocked(search);
const mockedBuildQueryStringFromFilterFormValues = jest.mocked(buildQueryStringFromFilterFormValues);
const mockedBuildSearchQueryJSON = jest.mocked(buildSearchQueryJSON);

// useOnyx mock, applying the selector to seeded data the way the unit tests of this hook do.

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = onyxData[key];
    const selected = options?.selector ? options.selector(value) : value;
    return [selected];
});

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => mockUseOnyx(key, options),
}));

// Helpers

function makeTransaction(overrides: Partial<Transaction> & {transactionID: string}): Transaction {
    return createMock<Transaction>({
        reportID: OWNED_REPORT_ID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        merchant: 'Merchant',
        created: '2026-06-01',
        ...overrides,
    });
}

/** Only `hash` is read by the hook, but the real parser returns a full query, so build one rather than assert a partial. */
function makeQueryJSON(hash: number): SearchQueryJSON {
    return {
        hash,
        recentSearchHash: hash,
        similarSearchHash: hash,
        inputQuery: `type:expense from:${ACCOUNT_ID}`,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        view: CONST.SEARCH.VIEW.TABLE,
        filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: String(ACCOUNT_ID)},
        flatFilters: [],
    };
}

/** Seeds the current user's expense snapshot with the given transactions and the report they attach to. */
function setupSnapshot(transactions: Transaction[]) {
    const report = createMock<Report>({reportID: OWNED_REPORT_ID, ownerAccountID: ACCOUNT_ID});
    const data: Record<string, unknown> = {[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report};
    for (const transaction of transactions) {
        data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }
    onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`] = {data, search: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED}};
}

/** Seeds the local `transactions_` collection, which is what optimistic expense creation writes to Onyx. */
function setupLocalTransactions(transactions: Transaction[]) {
    const collection: Record<string, Transaction> = {};
    for (const transaction of transactions) {
        collection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }
    onyxData[ONYXKEYS.COLLECTION.TRANSACTION] = collection;
}

function transactionIDs(transactions: RecentlyAddedExpense[] | undefined): string[] {
    return (transactions ?? []).map((transaction) => transaction.transactionID);
}

/** Records every settled result of the real hook, so a test can compare what it returned before a hide and after the reveal. */
let observedResults: Array<ReturnType<typeof useRecentlyAddedData>> = [];

function RecentlyAddedProbe() {
    const data = useRecentlyAddedData();

    useEffect(() => {
        observedResults.push(data);
    });

    return null;
}

function lastObserved() {
    return observedResults.at(-1);
}

beforeEach(() => {
    for (const key of Object.keys(onyxData)) {
        delete onyxData[key];
    }
    observedResults = [];
    mockUseOnyx.mockClear();
    mockedSearch.mockClear();
    mockedUseIsFocused.mockReturnValue(true);
    mockedUseNetwork.mockReturnValue({isOffline: false});
    // The hash follows the account, as in production, so an account change is a real dependency change for the effect.
    mockedBuildQueryStringFromFilterFormValues.mockImplementation((values) => `type:expense from:${values.from?.at(0) ?? ''}`);
    mockedBuildSearchQueryJSON.mockImplementation((query) => makeQueryJSON(query.includes(String(OTHER_ACCOUNT_ID)) ? OTHER_SNAPSHOT_HASH : SNAPSHOT_HASH));
    mockedUseCurrentUserPersonalDetails.mockReturnValue(createMock<CurrentUserPersonalDetails>({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`}));
    setupSnapshot([]);
});

describe('useRecentlyAddedData under a screen cover', () => {
    it('fetches once on mount', () => {
        renderScreenWithCover(<RecentlyAddedProbe />);

        expect(mockedSearch).toHaveBeenCalledTimes(1);
        expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: expect.objectContaining({hash: SNAPSHOT_HASH})}));
    });

    it('issues no fetch while hidden and re-fires the fetch once on reveal, as a tab focus does today', async () => {
        const screen = renderScreenWithCover(<RecentlyAddedProbe />);

        await screen.hide();

        expect(mockedSearch).toHaveBeenCalledTimes(1);

        await screen.reveal();

        // Without the wrapper the effect dependencies are unchanged, so only a real `isFocused` flip re-fires today.
        expect(mockedSearch).toHaveBeenCalledTimes(getCoverMode() === 'activity' ? 2 : 1);
    });

    it('folds an account change made behind the cover into the single reveal fetch', async () => {
        const screen = renderScreenWithCover(<RecentlyAddedProbe />);

        await screen.hide();
        mockedUseCurrentUserPersonalDetails.mockReturnValue(createMock<CurrentUserPersonalDetails>({accountID: OTHER_ACCOUNT_ID, login: `${OTHER_ACCOUNT_ID}@test.com`}));

        expect(mockedSearch).toHaveBeenCalledTimes(1);

        await screen.reveal();

        expect(mockedSearch).toHaveBeenCalledTimes(2);
        expect(mockedSearch).toHaveBeenLastCalledWith(expect.objectContaining({queryJSON: expect.objectContaining({hash: OTHER_SNAPSHOT_HASH})}));
    });

    it('fetches once on reveal after a reconnect that happened behind the cover', async () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        const screen = renderScreenWithCover(<RecentlyAddedProbe />);

        expect(mockedSearch).not.toHaveBeenCalled();

        await screen.hide();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        await screen.reveal();

        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('holds back the fetch of a reconnect that re-renders behind the cover until the reveal', async () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        const screen = renderScreenWithCover(<RecentlyAddedProbe />);

        await screen.hide();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        // A second hide re-renders the covered screen, which is what the navigator does while another tab is on top.
        await screen.hide();

        // The covered subtree has no mounted effect, so the dependency change cannot reach the network before the reveal.
        expect(mockedSearch).toHaveBeenCalledTimes(getCoverMode() === 'activity' ? 0 : 1);

        await screen.reveal();

        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('never fetches while the screen is not focused', async () => {
        mockedUseIsFocused.mockReturnValue(false);
        const screen = renderScreenWithCover(<RecentlyAddedProbe />);

        await screen.hide();
        await screen.reveal();

        expect(mockedSearch).not.toHaveBeenCalled();
    });

    it('keeps the just-created expense held in state across a hide, before the refreshed snapshot arrives', async () => {
        setupLocalTransactions([makeTransaction({transactionID: 'new', inserted: '2026-06-02 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})]);
        const screen = renderScreenWithCover(<RecentlyAddedProbe />);

        expect(transactionIDs(lastObserved()?.transactions)).toEqual(['new']);

        await screen.hide();
        // The sync clears `pendingAction` behind the cover while the snapshot still does not list the expense, so only
        // the unconfirmed ID remembered in state before the hide keeps the row.
        setupLocalTransactions([makeTransaction({transactionID: 'new', inserted: '2026-06-02 10:00:00'})]);
        await screen.reveal();

        expect(transactionIDs(lastObserved()?.transactions)).toEqual(['new']);
        expect(lastObserved()?.isAwaitingFirstResult).toBe(false);
    });
});
