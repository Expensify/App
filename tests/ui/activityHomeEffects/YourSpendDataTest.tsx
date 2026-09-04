/**
 * Cover/reveal contract of the Your spend fetch hook once the Home tab sits under `ScreenActivityWrapper`:
 *   - the mount fetch fires once per applicable query
 *   - a hide issues no fetch and a reveal re-fires each query exactly once, the request a tab focus fires today
 *   - an account change or a reconnect that happens behind the cover folds into that single reveal fetch
 *   - an unfocused screen never fetches
 *   - the cached approval total held in state survives the hide
 */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';

import {search} from '@libs/actions/Search';
import {getDisplayableExpensifyCards, getDisplayableThirdPartyCards} from '@libs/CardUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import {YOUR_SPEND_ROW_STATE} from '@pages/home/YourSpendSection/const';
import {buildAwaitingApprovalQuery, buildRecentCardTransactionsQuery, buildRepaidLast30DaysQuery} from '@pages/home/YourSpendSection/queries';
import {useYourSpendData} from '@pages/home/YourSpendSection/useYourSpendData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type SearchResults from '@src/types/onyx/SearchResults';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

import createMock from '../../utils/createMock';
import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

const ACCOUNT_ID = 12345;
const OTHER_ACCOUNT_ID = 67890;

// Fixed query strings the mocked builders return, valid for the parser so the hook computes real hashes from them.
const APPROVAL_QUERY = `type:expense status:outstanding from:${ACCOUNT_ID} reimbursable:yes`;
const PAYMENT_QUERY = `type:expense status:paid from:${ACCOUNT_ID} reimbursable:yes`;
const CARD_QUERY = `type:expense from:${ACCOUNT_ID} cardID:11111`;

// Module mocks

jest.mock('@pages/home/YourSpendSection/queries', () => ({
    buildAwaitingApprovalQuery: jest.fn(),
    buildRepaidLast30DaysQuery: jest.fn(),
    buildRecentCardTransactionsQuery: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
    createNavigationContainerRef: () => ({}),
}));

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: jest.fn(() => ({isOffline: false})),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`})),
}));

jest.mock('@libs/CardUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/CardUtils'),
    getDisplayableExpensifyCards: jest.fn(() => []),
    getDisplayableThirdPartyCards: jest.fn(() => []),
}));

const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseNetwork = jest.mocked(useNetwork);
const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockedSearch = jest.mocked(search);
const mockedGetDisplayableExpensifyCards = jest.mocked(getDisplayableExpensifyCards);
const mockedGetDisplayableThirdPartyCards = jest.mocked(getDisplayableThirdPartyCards);
const mockedBuildAwaitingApprovalQuery = jest.mocked(buildAwaitingApprovalQuery);
const mockedBuildRepaidLast30DaysQuery = jest.mocked(buildRepaidLast30DaysQuery);
const mockedBuildRecentCardTransactionsQuery = jest.mocked(buildRecentCardTransactionsQuery);

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

function makeCorporatePolicy(): Policy {
    return createMock<Policy>({
        id: 'policy_1',
        name: 'Corp Policy',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: 'admin',
        owner: 'test@example.com',
        ownerAccountID: ACCOUNT_ID,
        outputCurrency: CONST.CURRENCY.USD,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
    });
}

function makeOutstandingReport(): Report {
    return createMock<Report>({
        reportID: 'r1',
        policyID: 'policy_1',
        ownerAccountID: ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    });
}

function makeSearchResultsWithCount(count: number): SearchResults {
    return createMock<SearchResults>({
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            offset: 0,
            hash: 0,
            sortBy: 'date',
            sortOrder: 'desc',
            hasMoreResults: false,
            hasResults: count > 0,
            isLoading: false,
            count,
        },
        data: {},
    });
}

// A zero-result search comes back with `count` missing, not 0.
const WIPED_SNAPSHOT = createMock<SearchResults>({search: {count: undefined}, data: {}});

function setupPolicies(policies: Policy[]) {
    onyxData[ONYXKEYS.COLLECTION.POLICY] = Object.fromEntries(policies.map((policy) => [policy.id, policy]));
}

function setupReports(reports: Report[]) {
    onyxData[ONYXKEYS.COLLECTION.REPORT] = Object.fromEntries(reports.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report]));
}

function setupApprovalSnapshot(results: SearchResults | undefined) {
    const hash = buildSearchQueryJSON(APPROVAL_QUERY)?.hash;
    onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`] = results;
}

function searchCallCountFor(query: string): number {
    const hash = buildSearchQueryJSON(query)?.hash;
    return mockedSearch.mock.calls.filter(([params]) => params.queryJSON.hash === hash).length;
}

/** Records every settled result of the real hook, so a test can compare what it returned before a hide and after the reveal. */
let observedResults: Array<ReturnType<typeof useYourSpendData>> = [];

function YourSpendProbe() {
    const data = useYourSpendData();

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

    mockedBuildAwaitingApprovalQuery.mockReturnValue(APPROVAL_QUERY);
    mockedBuildRepaidLast30DaysQuery.mockReturnValue(PAYMENT_QUERY);
    mockedBuildRecentCardTransactionsQuery.mockReturnValue(CARD_QUERY);

    mockedUseIsFocused.mockReturnValue(true);
    mockedUseNetwork.mockReturnValue({isOffline: false});
    mockedUseCurrentUserPersonalDetails.mockReturnValue(createMock<CurrentUserPersonalDetails>({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`}));
    mockedGetDisplayableExpensifyCards.mockReturnValue([]);
    mockedGetDisplayableThirdPartyCards.mockReturnValue([]);

    // A real corporate policy with payments enabled makes both the approval and the payment query applicable.
    setupPolicies([makeCorporatePolicy()]);
});

describe('useYourSpendData under a screen cover', () => {
    it('fetches each applicable query once on mount', () => {
        renderScreenWithCover(<YourSpendProbe />);

        expect(searchCallCountFor(APPROVAL_QUERY)).toBe(1);
        expect(searchCallCountFor(PAYMENT_QUERY)).toBe(1);
        expect(mockedSearch).toHaveBeenCalledTimes(2);
    });

    it('issues no fetch while hidden and re-fires each query once on reveal, as a tab focus does today', async () => {
        const screen = renderScreenWithCover(<YourSpendProbe />);

        await screen.hide();

        expect(mockedSearch).toHaveBeenCalledTimes(2);

        await screen.reveal();

        // Without the wrapper the effect dependencies are unchanged, so only a real `isFocused` flip re-fires today.
        const expectedFiresPerQuery = getCoverMode() === 'activity' ? 2 : 1;
        expect(searchCallCountFor(APPROVAL_QUERY)).toBe(expectedFiresPerQuery);
        expect(searchCallCountFor(PAYMENT_QUERY)).toBe(expectedFiresPerQuery);
        expect(mockedSearch).toHaveBeenCalledTimes(2 * expectedFiresPerQuery);
    });

    it('folds an account change made behind the cover into the single reveal fetch', async () => {
        const screen = renderScreenWithCover(<YourSpendProbe />);

        await screen.hide();
        mockedUseCurrentUserPersonalDetails.mockReturnValue(createMock<CurrentUserPersonalDetails>({accountID: OTHER_ACCOUNT_ID, login: `${OTHER_ACCOUNT_ID}@test.com`}));

        expect(mockedSearch).toHaveBeenCalledTimes(2);

        await screen.reveal();

        expect(searchCallCountFor(APPROVAL_QUERY)).toBe(2);
        expect(searchCallCountFor(PAYMENT_QUERY)).toBe(2);
        expect(mockedSearch).toHaveBeenCalledTimes(4);
    });

    it('fetches once on reveal after a reconnect that happened behind the cover', async () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        const screen = renderScreenWithCover(<YourSpendProbe />);

        expect(mockedSearch).not.toHaveBeenCalled();

        await screen.hide();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        await screen.reveal();

        expect(searchCallCountFor(APPROVAL_QUERY)).toBe(1);
        expect(searchCallCountFor(PAYMENT_QUERY)).toBe(1);
        expect(mockedSearch).toHaveBeenCalledTimes(2);
    });

    it('holds back the fetch of a reconnect that re-renders behind the cover until the reveal', async () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        const screen = renderScreenWithCover(<YourSpendProbe />);

        await screen.hide();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        // A second hide re-renders the covered screen, which is what the navigator does while another tab is on top.
        await screen.hide();

        // The covered subtree has no mounted effect, so the dependency change cannot reach the network before the reveal.
        expect(mockedSearch).toHaveBeenCalledTimes(getCoverMode() === 'activity' ? 0 : 2);

        await screen.reveal();

        expect(searchCallCountFor(APPROVAL_QUERY)).toBe(1);
        expect(searchCallCountFor(PAYMENT_QUERY)).toBe(1);
        expect(mockedSearch).toHaveBeenCalledTimes(2);
    });

    it('never fetches while the screen is not focused', async () => {
        mockedUseIsFocused.mockReturnValue(false);
        const screen = renderScreenWithCover(<YourSpendProbe />);

        await screen.hide();
        await screen.reveal();

        expect(mockedSearch).not.toHaveBeenCalled();
    });

    it('keeps the cached approval total held in state across a hide, so a wiped count behind the cover still shows the row', async () => {
        setupReports([makeOutstandingReport()]);
        setupApprovalSnapshot(makeSearchResultsWithCount(2));
        const screen = renderScreenWithCover(<YourSpendProbe />);

        const beforeHide = lastObserved();
        expect(beforeHide?.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.READY);

        await screen.hide();
        // The re-fired search returns no count while the user still owns an outstanding report, which only the
        // cached total captured before the hide can bridge.
        setupApprovalSnapshot(WIPED_SNAPSHOT);
        await screen.reveal();

        const afterReveal = lastObserved();
        expect(afterReveal?.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.READY);
        expect(afterReveal?.approvalTotals).toEqual(beforeHide?.approvalTotals);
    });
});
