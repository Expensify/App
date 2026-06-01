/**
 * Contracts asserted:
 *   - approvalRowState state machine: HIDDEN / LOADING / READY / HIDDEN_EMPTY
 *   - paymentRowState state machine: same transitions
 *   - cardRows assembled from getDisplayableExpensifyCards (cardID, lastFour, query per card)
 *   - query builders are called with the current user's accountID
 *   - awaitingApprovalQuery / repaidLast30DaysQuery are exposed on the return value
 *   - search() is dispatched when focused and online; suppressed when offline
 */
import {renderHook} from '@testing-library/react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import {search} from '@libs/actions/Search';
import {getDisplayableExpensifyCards} from '@libs/CardUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import YOUR_SPEND_ROW_STATE from '@pages/home/YourSpendSection/const';
import {buildAwaitingApprovalQuery, buildRecentCardTransactionsQuery, buildRepaidLast30DaysQuery} from '@pages/home/YourSpendSection/queries';
import {useYourSpendData} from '@pages/home/YourSpendSection/useYourSpendData';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy, Report} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type SearchResults from '@src/types/onyx/SearchResults';

// Constants

const ACCOUNT_ID = 12345;
const CARD_ID_1 = 11111;
const CARD_ID_2 = 22222;
const CARD_LAST_FOUR_1 = '1111';
const CARD_LAST_FOUR_2 = '2222';

// Fixed query strings the mocked builders will return.
// These must be valid query strings the search parser accepts, so
// buildSearchQueryJSON can compute real hashes from them, matching
// what the hook computes during rendering.
const APPROVAL_QUERY = `type:expense status:outstanding from:${ACCOUNT_ID} reimbursable:yes`;
const PAYMENT_QUERY = `type:expense status:paid from:${ACCOUNT_ID} reimbursable:yes`;
const CARD_QUERY_1 = `type:expense from:${ACCOUNT_ID} cardID:${CARD_ID_1}`;
const CARD_QUERY_2 = `type:expense from:${ACCOUNT_ID} cardID:${CARD_ID_2}`;

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
}));

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn(() => false),
}));

// Typed references to mocked modules

const mockedUseNetwork = jest.mocked(useNetwork);
const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockedSearch = jest.mocked(search);
const mockedGetDisplayableExpensifyCards = jest.mocked(getDisplayableExpensifyCards);
const mockedIsPaidGroupPolicy = jest.mocked(isPaidGroupPolicy);
const mockedBuildAwaitingApprovalQuery = jest.mocked(buildAwaitingApprovalQuery);
const mockedBuildRepaidLast30DaysQuery = jest.mocked(buildRepaidLast30DaysQuery);
const mockedBuildRecentCardTransactionsQuery = jest.mocked(buildRecentCardTransactionsQuery);

// useOnyx mock

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string, options?: {selector?: (v: unknown) => unknown}) => {
    const value = onyxData[key];
    const selected = options?.selector ? options.selector(value) : value;
    return [selected];
});

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (v: unknown) => unknown}) => mockUseOnyx(key, options),
}));

// Helpers

function makeCorporatePolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        id: 'policy_1',
        name: 'Corp Policy',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: 'admin',
        owner: 'test@example.com',
        ownerAccountID: ACCOUNT_ID,
        isPolicyExpenseChatEnabled: true,
        outputCurrency: CONST.CURRENCY.USD,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        ...overrides,
    } as Policy;
}

function makeSearchResultsWithCount(count: number): SearchResults {
    return {
        search: {
            type: 'expense',
            status: '',
            offset: 0,
            hasMoreResults: false,
            hasResults: count > 0,
            isLoading: false,
            count,
        },
        data: {},
    } as SearchResults;
}

/** Populates onyxData with a single-entry policies collection. */
function setupPolicies(policies: Policy[]) {
    onyxData[ONYXKEYS.COLLECTION.POLICY] = Object.fromEntries(policies.map((p) => [p.id, p]));
}

/** Seeds the Onyx snapshot slot that the approval query will subscribe to. */
function setupApprovalSnapshot(results: SearchResults | undefined) {
    const hash = buildSearchQueryJSON(APPROVAL_QUERY)?.hash;
    onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`] = results;
}

/** Seeds the Onyx snapshot slot that the payment query will subscribe to. */
function setupPaymentSnapshot(results: SearchResults | undefined) {
    const hash = buildSearchQueryJSON(PAYMENT_QUERY)?.hash;
    onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`] = results;
}

/** Seeds the allSnapshots collection with a card snapshot so the hook can read count/total/currency. */
function setupCardSnapshot(cardID: number, results: SearchResults | undefined) {
    const cardQuery = cardID === CARD_ID_1 ? CARD_QUERY_1 : CARD_QUERY_2;
    const hash = buildSearchQueryJSON(cardQuery)?.hash;
    if (!onyxData[ONYXKEYS.COLLECTION.SNAPSHOT]) {
        onyxData[ONYXKEYS.COLLECTION.SNAPSHOT] = {};
    }
    (onyxData[ONYXKEYS.COLLECTION.SNAPSHOT] as Record<string, unknown>)[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`] = results;
}

/** Returns a typed offline payload for `useNetwork.mockReturnValue`. */
function networkState(isOffline: boolean): ReturnType<typeof useNetwork> {
    return {isOffline};
}

/** Builds a `Card[]` payload for `getDisplayableExpensifyCards.mockReturnValue`. */
function makeDisplayableCards(cards: Array<{cardID: number; lastFourPAN: string}>): Card[] {
    return cards as unknown as Card[];
}

// Common beforeEach

beforeEach(() => {
    for (const k of Object.keys(onyxData)) {
        delete onyxData[k];
    }
    mockUseOnyx.mockClear();
    mockedSearch.mockClear();

    mockedBuildAwaitingApprovalQuery.mockReturnValue(APPROVAL_QUERY);
    mockedBuildRepaidLast30DaysQuery.mockReturnValue(PAYMENT_QUERY);
    mockedBuildRecentCardTransactionsQuery.mockImplementation((_accountID: number, cardID: number) => (cardID === CARD_ID_1 ? CARD_QUERY_1 : CARD_QUERY_2));

    mockedUseNetwork.mockReturnValue(networkState(false));
    mockedUseCurrentUserPersonalDetails.mockReturnValue({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`} as CurrentUserPersonalDetails);
    mockedGetDisplayableExpensifyCards.mockReturnValue([]);
    mockedIsPaidGroupPolicy.mockReturnValue(false);

    // Default policies: one CORPORATE policy, no approval flow, payments enabled
    setupPolicies([makeCorporatePolicy()]);
});

// approvalRowState

describe('useYourSpendData — approvalRowState', () => {
    it('returns HIDDEN when no policy has an approval flow', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(false);
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.HIDDEN);
    });

    it('returns LOADING when applicable, online, and snapshot not yet populated', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        // No snapshot entry → undefined
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.LOADING);
    });

    it('returns READY when applicable and snapshot has count > 0', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupApprovalSnapshot(makeSearchResultsWithCount(5));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.READY);
    });

    it('returns HIDDEN_EMPTY when applicable and snapshot has count === 0', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupApprovalSnapshot(makeSearchResultsWithCount(0));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY);
    });

    it('returns HIDDEN_EMPTY when applicable, offline, and no cached snapshot', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        mockedUseNetwork.mockReturnValue(networkState(true));
        // No snapshot set
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY);
    });

    it('returns READY when applicable, offline, and cached snapshot has count > 0', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        mockedUseNetwork.mockReturnValue(networkState(true));
        setupApprovalSnapshot(makeSearchResultsWithCount(3));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.READY);
    });
});

// paymentRowState

describe('useYourSpendData — paymentRowState', () => {
    it('returns HIDDEN when reimbursement is disabled on all policies (personal/free or REIMBURSEMENT_NO)', () => {
        setupPolicies([makeCorporatePolicy({reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO})]);
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.paymentRowState).toBe(YOUR_SPEND_ROW_STATE.HIDDEN);
    });

    it('returns LOADING when applicable, online, and payment snapshot not yet populated', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupPolicies([makeCorporatePolicy({reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES})]);
        // No snapshot entry
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.paymentRowState).toBe(YOUR_SPEND_ROW_STATE.LOADING);
    });

    it('returns READY when applicable and payment snapshot has count > 0', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupPolicies([makeCorporatePolicy({reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES})]);
        setupPaymentSnapshot(makeSearchResultsWithCount(2));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.paymentRowState).toBe(YOUR_SPEND_ROW_STATE.READY);
    });

    it('returns HIDDEN_EMPTY when applicable and payment snapshot has count === 0', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupPolicies([makeCorporatePolicy({reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES})]);
        setupPaymentSnapshot(makeSearchResultsWithCount(0));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.paymentRowState).toBe(YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY);
    });

    it('returns HIDDEN_EMPTY when applicable, offline, and no cached payment snapshot', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupPolicies([makeCorporatePolicy({reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES})]);
        mockedUseNetwork.mockReturnValue(networkState(true));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.paymentRowState).toBe(YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY);
    });

    it('applies to REIMBURSEMENT_MANUAL (track) as well as REIMBURSEMENT_YES (direct)', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupPolicies([makeCorporatePolicy({reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL})]);
        setupPaymentSnapshot(makeSearchResultsWithCount(1));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.paymentRowState).toBe(YOUR_SPEND_ROW_STATE.READY);
    });
});

// cardRows

describe('useYourSpendData — cardRows', () => {
    it('returns an empty array when there are no displayable cards', () => {
        mockedGetDisplayableExpensifyCards.mockReturnValue([]);
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toEqual([]);
    });

    it('excludes a card when its snapshot has not loaded yet (no recent-transactions confirmation)', () => {
        mockedGetDisplayableExpensifyCards.mockReturnValue(makeDisplayableCards([{cardID: CARD_ID_1, lastFourPAN: CARD_LAST_FOUR_1}]));
        // No snapshot seeded → hook cannot confirm any transactions exist
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(0);
    });

    it('excludes a card whose snapshot has count === 0 (no transactions in last 30 days)', () => {
        mockedGetDisplayableExpensifyCards.mockReturnValue(makeDisplayableCards([{cardID: CARD_ID_1, lastFourPAN: CARD_LAST_FOUR_1}]));
        setupCardSnapshot(CARD_ID_1, makeSearchResultsWithCount(0));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(0);
    });

    it('returns one row with correct cardID, lastFour, and query when snapshot confirms recent transactions', () => {
        mockedGetDisplayableExpensifyCards.mockReturnValue(makeDisplayableCards([{cardID: CARD_ID_1, lastFourPAN: CARD_LAST_FOUR_1}]));
        setupCardSnapshot(CARD_ID_1, makeSearchResultsWithCount(3));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(1);
        expect(result.current.cardRows.at(0)).toMatchObject({
            cardID: CARD_ID_1,
            lastFour: CARD_LAST_FOUR_1,
            query: CARD_QUERY_1,
        });
    });

    it('returns multiple rows in order when all cards have recent transactions', () => {
        mockedGetDisplayableExpensifyCards.mockReturnValue(
            makeDisplayableCards([
                {cardID: CARD_ID_1, lastFourPAN: CARD_LAST_FOUR_1},
                {cardID: CARD_ID_2, lastFourPAN: CARD_LAST_FOUR_2},
            ]),
        );
        setupCardSnapshot(CARD_ID_1, makeSearchResultsWithCount(5));
        setupCardSnapshot(CARD_ID_2, makeSearchResultsWithCount(2));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(2);
        expect(result.current.cardRows.at(0)).toMatchObject({cardID: CARD_ID_1, lastFour: CARD_LAST_FOUR_1, query: CARD_QUERY_1});
        expect(result.current.cardRows.at(1)).toMatchObject({cardID: CARD_ID_2, lastFour: CARD_LAST_FOUR_2, query: CARD_QUERY_2});
    });

    it('only includes cards with recent transactions when some have count 0 and others have count > 0', () => {
        mockedGetDisplayableExpensifyCards.mockReturnValue(
            makeDisplayableCards([
                {cardID: CARD_ID_1, lastFourPAN: CARD_LAST_FOUR_1},
                {cardID: CARD_ID_2, lastFourPAN: CARD_LAST_FOUR_2},
            ]),
        );
        setupCardSnapshot(CARD_ID_1, makeSearchResultsWithCount(0));
        setupCardSnapshot(CARD_ID_2, makeSearchResultsWithCount(4));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(1);
        expect(result.current.cardRows.at(0)).toMatchObject({cardID: CARD_ID_2, lastFour: CARD_LAST_FOUR_2});
    });
});

// query builder integration

describe('useYourSpendData — query builder integration', () => {
    it('calls buildAwaitingApprovalQuery with the current user accountID and an empty policyIDs list when the user has no paid group policy', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(false);
        renderHook(() => useYourSpendData());
        expect(buildAwaitingApprovalQuery).toHaveBeenCalledWith(ACCOUNT_ID, []);
    });

    it('passes the IDs of paid group policies into buildAwaitingApprovalQuery', () => {
        const policyA = makeCorporatePolicy({id: 'policy_a'});
        const policyB = makeCorporatePolicy({id: 'policy_b'});
        setupPolicies([policyA, policyB]);
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        renderHook(() => useYourSpendData());
        expect(buildAwaitingApprovalQuery).toHaveBeenCalledWith(ACCOUNT_ID, expect.arrayContaining(['policy_a', 'policy_b']));
    });

    it('excludes policies that do not pass isPaidGroupPolicy from the policyIDs list', () => {
        const paidGroup = makeCorporatePolicy({id: 'paid_group'});
        const otherPolicy = makeCorporatePolicy({id: 'other'});
        setupPolicies([paidGroup, otherPolicy]);
        mockedIsPaidGroupPolicy.mockImplementation((p) => p?.id === 'paid_group');
        renderHook(() => useYourSpendData());
        expect(buildAwaitingApprovalQuery).toHaveBeenCalledWith(ACCOUNT_ID, ['paid_group']);
    });

    it('calls buildRepaidLast30DaysQuery with the current user accountID', () => {
        renderHook(() => useYourSpendData());
        expect(buildRepaidLast30DaysQuery).toHaveBeenCalledWith(ACCOUNT_ID);
    });

    it('calls buildRecentCardTransactionsQuery with accountID and the card cardID', () => {
        mockedGetDisplayableExpensifyCards.mockReturnValue(makeDisplayableCards([{cardID: CARD_ID_1, lastFourPAN: CARD_LAST_FOUR_1}]));
        renderHook(() => useYourSpendData());
        expect(buildRecentCardTransactionsQuery).toHaveBeenCalledWith(ACCOUNT_ID, CARD_ID_1);
    });

    it('exposes awaitingApprovalQuery from the builder return value', () => {
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.awaitingApprovalQuery).toBe(APPROVAL_QUERY);
    });

    it('exposes repaidLast30DaysQuery from the builder return value', () => {
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.repaidLast30DaysQuery).toBe(PAYMENT_QUERY);
    });
});

// search dispatch

describe('useYourSpendData — search dispatch', () => {
    it('dispatches search() with shouldCalculateTotals:true and shouldUpdateLastSearchParams:false when focused and online', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        renderHook(() => useYourSpendData());
        expect(search).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldCalculateTotals: true,
                shouldUpdateLastSearchParams: false,
            }),
        );
    });

    it('does not dispatch search() when offline', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        mockedUseNetwork.mockReturnValue(networkState(true));
        renderHook(() => useYourSpendData());
        expect(search).not.toHaveBeenCalled();
    });

    it('dispatches search() with the approval queryJSON hash', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        renderHook(() => useYourSpendData());
        const expectedHash = buildSearchQueryJSON(APPROVAL_QUERY)?.hash;
        expect(search).toHaveBeenCalledWith(
            expect.objectContaining({
                queryJSON: expect.objectContaining({hash: expectedHash}),
            }),
        );
    });
});

// approval cache scoped by query hash

describe('useYourSpendData — approval cache is keyed by query hash', () => {
    // Second valid query string with a different hash, simulating the user's paid-workspace
    // set changing (which changes the policyID filter and therefore the approval query hash).
    const APPROVAL_QUERY_B = `type:expense status:outstanding from:${ACCOUNT_ID} reimbursable:yes policyID:other_policy`;

    function setupApprovalSnapshotForQuery(query: string, results: SearchResults | undefined) {
        const hash = buildSearchQueryJSON(query)?.hash;
        onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`] = results;
    }

    it('does not reuse a previous-hash cached READY total after the approval query hash changes', () => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);

        // Render with query A: snapshot READY with count > 0 so the cache fills.
        mockedBuildAwaitingApprovalQuery.mockReturnValue(APPROVAL_QUERY);
        setupApprovalSnapshotForQuery(APPROVAL_QUERY, makeSearchResultsWithCount(3));
        const {result, rerender} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.READY);

        // Switch to query B (different hash), with count missing on B's snapshot — the situation
        // that would let a stale-cache reuse happen if the cache weren't keyed by hash.
        mockedBuildAwaitingApprovalQuery.mockReturnValue(APPROVAL_QUERY_B);
        setupApprovalSnapshotForQuery(APPROVAL_QUERY_B, {search: {count: undefined}, data: {}} as unknown as SearchResults);
        rerender(undefined);

        // Should NOT be READY — the cache for hash A must not apply to hash B.
        expect(result.current.approvalRowState).not.toBe(YOUR_SPEND_ROW_STATE.READY);
    });
});

// refire on report state change

describe('useYourSpendData — refires search when a relevant report state changes', () => {
    function makeReport(overrides: Partial<Report> = {}): Report {
        return {
            reportID: 'r1',
            policyID: 'policy_1',
            ownerAccountID: ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            ...overrides,
        } as Report;
    }

    function setupReports(reports: Report[]) {
        onyxData[ONYXKEYS.COLLECTION.REPORT] = Object.fromEntries(reports.map((r) => [`${ONYXKEYS.COLLECTION.REPORT}${r.reportID}`, r]));
    }

    /** Counts how many times search() has been dispatched for the approval query. */
    function approvalSearchCallCount(): number {
        const approvalHash = buildSearchQueryJSON(APPROVAL_QUERY)?.hash;
        return mockedSearch.mock.calls.filter((call) => call.at(0)?.queryJSON?.hash === approvalHash).length;
    }

    beforeEach(() => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupPolicies([makeCorporatePolicy({id: 'policy_1'})]);
    });

    it('refires the approval search when an owned report leaves the OUTSTANDING state', () => {
        setupReports([makeReport()]);
        const {rerender} = renderHook(() => useYourSpendData());
        const before = approvalSearchCallCount();

        // Approve the report: it leaves the OUTSTANDING set, so the signature changes.
        setupReports([makeReport({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED})]);
        rerender(undefined);

        expect(approvalSearchCallCount()).toBeGreaterThan(before);
    });

    it('does not refire when an unrelated field on the report changes', () => {
        setupReports([makeReport({reportName: 'Before'})]);
        const {rerender} = renderHook(() => useYourSpendData());
        const before = approvalSearchCallCount();

        // Same state/status, only a non-projected field changes — signature is unchanged.
        setupReports([makeReport({reportName: 'After'})]);
        rerender(undefined);

        expect(approvalSearchCallCount()).toBe(before);
    });

    it('does not refire when an OUTSTANDING report on an unrelated policy changes', () => {
        setupReports([makeReport()]);
        const {rerender} = renderHook(() => useYourSpendData());
        const before = approvalSearchCallCount();

        // Add an OUTSTANDING report on a policy that is not in paidGroupPolicyIDs.
        setupReports([makeReport(), makeReport({reportID: 'r2', policyID: 'policy_other'})]);
        rerender(undefined);

        expect(approvalSearchCallCount()).toBe(before);
    });
});

// approval cache is dropped when no outstanding reports remain

describe('useYourSpendData — drops the approval cache when no outstanding reports remain', () => {
    function makeReport(overrides: Partial<Report> = {}): Report {
        return {
            reportID: 'r1',
            policyID: 'policy_1',
            ownerAccountID: ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            ...overrides,
        } as Report;
    }

    function setupReports(reports: Report[]) {
        onyxData[ONYXKEYS.COLLECTION.REPORT] = Object.fromEntries(reports.map((r) => [`${ONYXKEYS.COLLECTION.REPORT}${r.reportID}`, r]));
    }

    // A zero-result search comes back with `count` missing (undefined), not 0.
    const WIPED_SNAPSHOT = {search: {count: undefined}, data: {}} as unknown as SearchResults;

    beforeEach(() => {
        mockedIsPaidGroupPolicy.mockReturnValue(true);
        setupPolicies([makeCorporatePolicy({id: 'policy_1'})]);
    });

    it('hides the approval row after the last outstanding report is approved', () => {
        // Outstanding report owned by the user → snapshot READY so the cache fills.
        setupReports([makeReport()]);
        setupApprovalSnapshot(makeSearchResultsWithCount(2));
        const {result, rerender} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.READY);

        // Approve the last report and let the re-fired search return no count. With no
        // outstanding reports left, the cached total must be dropped and the row hidden.
        setupReports([makeReport({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED})]);
        setupApprovalSnapshot(WIPED_SNAPSHOT);
        rerender(undefined);

        expect(result.current.approvalRowState).not.toBe(YOUR_SPEND_ROW_STATE.READY);
    });

    it('keeps the approval row via cache when count is wiped but an outstanding report remains', () => {
        // Original Search-screen wipe scenario: the report stays OUTSTANDING.
        setupReports([makeReport()]);
        setupApprovalSnapshot(makeSearchResultsWithCount(2));
        const {result, rerender} = renderHook(() => useYourSpendData());
        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.READY);

        // Count wiped, but the user still owns an outstanding report → cache bridges the gap.
        setupApprovalSnapshot(WIPED_SNAPSHOT);
        rerender(undefined);

        expect(result.current.approvalRowState).toBe(YOUR_SPEND_ROW_STATE.READY);
    });
});
