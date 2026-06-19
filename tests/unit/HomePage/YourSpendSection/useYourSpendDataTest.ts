/**
 * Contracts asserted:
 *   - approvalRowState state machine: HIDDEN / LOADING / READY / HIDDEN_EMPTY
 *   - paymentRowState state machine: same transitions
 *   - cardRows assembled from getDisplayableExpensifyCards (cardID, lastFour, query per card)
 *   - query builders are called with the current user's accountID
 *   - awaitingApprovalQuery / repaidLast30DaysQuery are exposed on the return value
 *   - search() is dispatched when focused and online; suppressed when offline
 */
import {act, renderHook} from '@testing-library/react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import {search} from '@libs/actions/Search';
import {getDisplayableExpensifyCards, getDisplayableThirdPartyCards} from '@libs/CardUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {YOUR_SPEND_ROW_STATE} from '@pages/home/YourSpendSection/const';
import {buildAwaitingApprovalQuery, buildRecentCardTransactionsQuery, buildRepaidLast30DaysQuery} from '@pages/home/YourSpendSection/queries';
import {useYourSpendData} from '@pages/home/YourSpendSection/useYourSpendData';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy, Report} from '@src/types/onyx';
import type {CardFeedErrors, CardFeedErrorState} from '@src/types/onyx/DerivedValues';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type SearchResults from '@src/types/onyx/SearchResults';

// Constants

const ACCOUNT_ID = 12345;
const CARD_ID_1 = 11111;
const CARD_ID_2 = 22222;
const CARD_LAST_FOUR_1 = '1111';
const CARD_LAST_FOUR_2 = '2222';

// Third-party card IDs (distinct from Expensify card IDs above).
const THIRD_PARTY_CARD_ID_1 = 33333;
const THIRD_PARTY_CARD_ID_2 = 44444;
const THIRD_PARTY_LAST_FOUR_1 = '3333';
const THIRD_PARTY_LAST_FOUR_2 = '4444';

// Fixed query strings the mocked builders will return.
// These must be valid query strings the search parser accepts, so
// buildSearchQueryJSON can compute real hashes from them, matching
// what the hook computes during rendering.
const APPROVAL_QUERY = `type:expense status:outstanding from:${ACCOUNT_ID} reimbursable:yes`;
const PAYMENT_QUERY = `type:expense status:paid from:${ACCOUNT_ID} reimbursable:yes`;
const CARD_QUERY_1 = `type:expense from:${ACCOUNT_ID} cardID:${CARD_ID_1}`;
const CARD_QUERY_2 = `type:expense from:${ACCOUNT_ID} cardID:${CARD_ID_2}`;
const THIRD_PARTY_QUERY_1 = `type:expense from:${ACCOUNT_ID} cardID:${THIRD_PARTY_CARD_ID_1}`;
const THIRD_PARTY_QUERY_2 = `type:expense from:${ACCOUNT_ID} cardID:${THIRD_PARTY_CARD_ID_2}`;

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

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn(() => false),
}));

// Typed references to mocked modules

const mockedUseNetwork = jest.mocked(useNetwork);
const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockedSearch = jest.mocked(search);
const mockedGetDisplayableExpensifyCards = jest.mocked(getDisplayableExpensifyCards);
const mockedGetDisplayableThirdPartyCards = jest.mocked(getDisplayableThirdPartyCards);
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
    let cardQuery: string;
    switch (cardID) {
        case CARD_ID_1:
            cardQuery = CARD_QUERY_1;
            break;
        case CARD_ID_2:
            cardQuery = CARD_QUERY_2;
            break;
        case THIRD_PARTY_CARD_ID_1:
            cardQuery = THIRD_PARTY_QUERY_1;
            break;
        case THIRD_PARTY_CARD_ID_2:
            cardQuery = THIRD_PARTY_QUERY_2;
            break;
        default:
            cardQuery = CARD_QUERY_2;
            break;
    }
    const hash = buildSearchQueryJSON(cardQuery)?.hash;
    if (!onyxData[ONYXKEYS.COLLECTION.SNAPSHOT]) {
        onyxData[ONYXKEYS.COLLECTION.SNAPSHOT] = {};
    }
    (onyxData[ONYXKEYS.COLLECTION.SNAPSHOT] as Record<string, unknown>)[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`] = results;
}

/** Builds a fully-populated `CardFeedErrors` value for `onyxData[ONYXKEYS.DERIVED.CARD_FEED_ERRORS]`. */
function makeCardFeedErrors(overrides: Partial<CardFeedErrors> = {}): CardFeedErrors {
    const defaultState: CardFeedErrorState = {shouldShowRBR: false, isFeedConnectionBroken: false, hasFeedErrors: false, hasWorkspaceErrors: false};
    return {
        cardFeedErrors: {},
        cardsWithBrokenFeedConnection: {},
        personalCardsWithBrokenConnection: {},
        shouldShowRbrForWorkspaceAccountID: {},
        shouldShowRbrForFeedNameWithDomainID: {},
        all: defaultState,
        companyCards: defaultState,
        expensifyCard: defaultState,
        personalCard: defaultState,
        ...overrides,
    };
}

/** Builds third-party `Card[]` fixtures for `getDisplayableThirdPartyCards.mockReturnValue`. */
function makeThirdPartyCards(cards: Array<{cardID: number; lastFourPAN?: string; cardName?: string; bank?: string; fundID?: string; lastScrapeResult?: number}>): Card[] {
    return cards.map((c) => ({
        accountID: ACCOUNT_ID,
        bank: c.bank ?? CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        cardID: c.cardID,
        cardName: c.cardName ?? '480801XXXXXX2554',
        domainName: 'feed-a.exfy',
        fraud: 'none',
        fundID: c.fundID ?? '767578',
        lastFourPAN: c.lastFourPAN ?? '',
        lastScrape: '',
        lastUpdated: '',
        lastScrapeResult: c.lastScrapeResult,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
    })) as unknown as Card[];
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
    mockedBuildRecentCardTransactionsQuery.mockImplementation((_accountID: number, cardID: number) => {
        switch (cardID) {
            case CARD_ID_1:
                return CARD_QUERY_1;
            case CARD_ID_2:
                return CARD_QUERY_2;
            case THIRD_PARTY_CARD_ID_1:
                return THIRD_PARTY_QUERY_1;
            case THIRD_PARTY_CARD_ID_2:
                return THIRD_PARTY_QUERY_2;
            default:
                return CARD_QUERY_2;
        }
    });

    mockedUseNetwork.mockReturnValue(networkState(false));
    mockedUseCurrentUserPersonalDetails.mockReturnValue({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`} as CurrentUserPersonalDetails);
    mockedGetDisplayableExpensifyCards.mockReturnValue([]);
    mockedGetDisplayableThirdPartyCards.mockReturnValue([]);
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

// third-party card rows
//
// These tests exercise the third-party card branch end-to-end via the hook.
// `getDisplayableThirdPartyCards` and `getDisplayableExpensifyCards` are both mocked,
// so each test seeds the displayable cards explicitly. Snapshot results are seeded
// through the same `setupCardSnapshot` helper used by the Expensify cardRows block.

describe('useYourSpendData — third-party cardRows', () => {
    it('orders Expensify Card rows before third-party card rows when both exist', () => {
        mockedGetDisplayableExpensifyCards.mockReturnValue(makeDisplayableCards([{cardID: CARD_ID_1, lastFourPAN: CARD_LAST_FOUR_1}]));
        mockedGetDisplayableThirdPartyCards.mockReturnValue(makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1}]));
        setupCardSnapshot(CARD_ID_1, makeSearchResultsWithCount(2));
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, makeSearchResultsWithCount(3));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(2);
        expect(result.current.cardRows.at(0)?.cardID).toBe(CARD_ID_1);
        expect(result.current.cardRows.at(1)?.cardID).toBe(THIRD_PARTY_CARD_ID_1);
    });

    it('produces a row for a third-party card with snapshot count > 0', () => {
        mockedGetDisplayableThirdPartyCards.mockReturnValue(makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1}]));
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, makeSearchResultsWithCount(5));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(1);
        expect(result.current.cardRows.at(0)).toMatchObject({cardID: THIRD_PARTY_CARD_ID_1, lastFour: THIRD_PARTY_LAST_FOUR_1, query: THIRD_PARTY_QUERY_1});
    });

    it('produces no row for a third-party card with snapshot count === 0', () => {
        mockedGetDisplayableThirdPartyCards.mockReturnValue(makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1}]));
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, makeSearchResultsWithCount(0));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(0);
    });

    it('tags the third-party row with kind=thirdParty and leaves spentFraction undefined', () => {
        mockedGetDisplayableThirdPartyCards.mockReturnValue(makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1}]));
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, makeSearchResultsWithCount(1));
        const {result} = renderHook(() => useYourSpendData());
        const row = result.current.cardRows.at(0);
        expect(row?.kind).toBe('thirdParty');
        expect(row?.spentFraction).toBeUndefined();
    });

    it('resolves lastFour from cardName ending in 4 digits when lastFourPAN is empty', () => {
        mockedGetDisplayableThirdPartyCards.mockReturnValue(makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: '', cardName: 'Chase 9876'}]));
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, makeSearchResultsWithCount(1));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(1);
        expect(result.current.cardRows.at(0)?.lastFour).toBe('9876');
    });

    it('suppresses the row when lastFourPAN is empty and cardName has no trailing 4 digits', () => {
        mockedGetDisplayableThirdPartyCards.mockReturnValue(makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: '', cardName: 'Chase'}]));
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, makeSearchResultsWithCount(1));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(0);
    });

    it('excludes any card the selector filters out (broken-state signals are owned by the selector)', () => {
        // The selector receives `cardFeedErrors` and is unit-tested separately. Here we just verify
        // the hook respects whatever set the selector returns: when the selector returns [], no row.
        mockedGetDisplayableThirdPartyCards.mockReturnValue([]);
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, makeSearchResultsWithCount(5));
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(0);
    });

    it('persists cached READY totals for a third-party card when the snapshot count is wiped', () => {
        mockedGetDisplayableThirdPartyCards.mockReturnValue(makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1}]));
        // First render: READY snapshot with count > 0 → row produced and total cached.
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, {
            search: {type: 'expense', status: '', offset: 0, hasMoreResults: false, hasResults: true, isLoading: false, count: 3, total: 1234, currency: 'USD'},
            data: {},
        } as SearchResults);
        const {result, rerender} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows.at(0)?.total).toBe(1234);

        // Search screen wipes count/total/currency on the shared snapshot.
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, {
            search: {type: 'expense', status: '', offset: 0, hasMoreResults: false, hasResults: true, isLoading: false, count: undefined, total: undefined, currency: undefined},
            data: {},
        } as unknown as SearchResults);
        rerender(undefined);
        // Cached total/currency must survive the wipe so the row stays.
        expect(result.current.cardRows).toHaveLength(1);
        expect(result.current.cardRows.at(0)?.total).toBe(1234);
        expect(result.current.cardRows.at(0)?.currency).toBe('USD');
    });

    it('fires search() for each third-party card snapshot when focused and online', () => {
        mockedGetDisplayableThirdPartyCards.mockReturnValue(
            makeThirdPartyCards([
                {cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1},
                {cardID: THIRD_PARTY_CARD_ID_2, lastFourPAN: THIRD_PARTY_LAST_FOUR_2},
            ]),
        );
        renderHook(() => useYourSpendData());
        const hash1 = buildSearchQueryJSON(THIRD_PARTY_QUERY_1)?.hash;
        const hash2 = buildSearchQueryJSON(THIRD_PARTY_QUERY_2)?.hash;
        expect(search).toHaveBeenCalledWith(expect.objectContaining({queryJSON: expect.objectContaining({hash: hash1})}));
        expect(search).toHaveBeenCalledWith(expect.objectContaining({queryJSON: expect.objectContaining({hash: hash2})}));
    });

    it('does not aggregate totals when two third-party rows have different currencies', () => {
        mockedGetDisplayableThirdPartyCards.mockReturnValue(
            makeThirdPartyCards([
                {cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1},
                {cardID: THIRD_PARTY_CARD_ID_2, lastFourPAN: THIRD_PARTY_LAST_FOUR_2},
            ]),
        );
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, {
            search: {type: 'expense', status: '', offset: 0, hasMoreResults: false, hasResults: true, isLoading: false, count: 2, total: 500, currency: 'USD'},
            data: {},
        } as SearchResults);
        setupCardSnapshot(THIRD_PARTY_CARD_ID_2, {
            search: {type: 'expense', status: '', offset: 0, hasMoreResults: false, hasResults: true, isLoading: false, count: 3, total: 2200, currency: 'EUR'},
            data: {},
        } as SearchResults);
        const {result} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(2);
        const [r1, r2] = result.current.cardRows;
        expect(r1).toMatchObject({cardID: THIRD_PARTY_CARD_ID_1, total: 500, currency: 'USD'});
        expect(r2).toMatchObject({cardID: THIRD_PARTY_CARD_ID_2, total: 2200, currency: 'EUR'});
    });

    it('R-2 reactivity: removing a broken-feed entry from Onyx makes the row appear; adding it makes the row disappear', () => {
        // The selector mock filters by what the hook passes in, so we can drive reactivity via Onyx.
        mockedGetDisplayableThirdPartyCards.mockImplementation((_cardList, errors) =>
            makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1}]).filter(
                (c) => !errors.cardsWithBrokenFeedConnection[c.cardID] && !errors.personalCardsWithBrokenConnection[c.cardID],
            ),
        );
        setupCardSnapshot(THIRD_PARTY_CARD_ID_1, makeSearchResultsWithCount(1));
        // Start: card is in broken-feed-connection map → row absent.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const brokenCard = makeThirdPartyCards([{cardID: THIRD_PARTY_CARD_ID_1, lastFourPAN: THIRD_PARTY_LAST_FOUR_1}]).at(0)!;
        onyxData[ONYXKEYS.DERIVED.CARD_FEED_ERRORS] = makeCardFeedErrors({cardsWithBrokenFeedConnection: {[THIRD_PARTY_CARD_ID_1]: brokenCard}});
        const {result, rerender} = renderHook(() => useYourSpendData());
        expect(result.current.cardRows).toHaveLength(0);

        // Mutate Onyx: remove the broken-feed entry → row should appear on re-render.
        act(() => {
            onyxData[ONYXKEYS.DERIVED.CARD_FEED_ERRORS] = makeCardFeedErrors({cardsWithBrokenFeedConnection: {}});
        });
        rerender(undefined);
        expect(result.current.cardRows).toHaveLength(1);

        // And back: re-add the broken-feed entry → row should disappear.
        act(() => {
            onyxData[ONYXKEYS.DERIVED.CARD_FEED_ERRORS] = makeCardFeedErrors({cardsWithBrokenFeedConnection: {[THIRD_PARTY_CARD_ID_1]: brokenCard}});
        });
        rerender(undefined);
        expect(result.current.cardRows).toHaveLength(0);
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
