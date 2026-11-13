import {act, renderHook} from '@testing-library/react-native';

import useCompanyCardNumberSearch from '@hooks/useCompanyCardNumberSearch';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {CompanyCardNumberSearchResult} from '@src/types/onyx/CompanyCardNumberSearch';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockSearchCompanyCardByNumber = jest.fn();
const mockClearCompanyCardNumberSearch = jest.fn();

jest.mock('@libs/actions/CompanyCards', () => ({
    searchCompanyCardByNumber: (...args: unknown[]): void => {
        mockSearchCompanyCardByNumber(...args);
    },
    clearCompanyCardNumberSearch: (...args: unknown[]): void => {
        mockClearCompanyCardNumberSearch(...args);
    },
}));

const POLICY_ID = 'POLICY1';
const FEED = 'cdf' as CompanyCardFeedWithNumber;
const FULL_NUMBER = '4111111111111111';
const PREFIX = ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARD_NUMBER_SEARCH;

const DOMAIN_ACCOUNT_ID = 1;

const getConsumerIDFromLastSearchCall = (): string => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const calls: unknown[][] = mockSearchCompanyCardByNumber.mock.calls;
    const consumerID = calls.at(-1)?.[1];
    if (typeof consumerID !== 'string') {
        throw new Error('Expected searchCompanyCardByNumber to have been called with a consumerID string');
    }
    return consumerID;
};

const seedResultsForConsumer = (consumerID: string, query: string, cards: CompanyCardNumberSearchResult[], hasError = false) =>
    act(async () => {
        await Onyx.set(`${PREFIX}${POLICY_ID}_${consumerID}`, {isLoading: false, query, cards, hasError});
    });

const renderSearch = async (feed: CompanyCardFeedWithNumber | undefined = FEED, domainAccountID: number | undefined = DOMAIN_ACCOUNT_ID) => {
    const hook = renderHook(() => useCompanyCardNumberSearch(POLICY_ID, feed, domainAccountID));
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

const typeNumber = async (hook: Awaited<ReturnType<typeof renderSearch>>, value: string) => {
    act(() => {
        hook.result.current.setSearchValue(value);
    });
    await act(async () => {
        jest.advanceTimersByTime(2000);
        await waitForBatchedUpdates();
    });
};

describe('useCompanyCardNumberSearch', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockSearchCompanyCardByNumber.mockClear();
        mockClearCompanyCardNumberSearch.mockClear();
        return Onyx.clear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('calls the API only for a 13-19 digit number, with spaces and dashes stripped', async () => {
        // Given a consumer that must distinguish suffix searches from full card numbers
        const hook = await renderSearch();

        // When only a suffix is entered
        await typeNumber(hook, '4111');
        // Then no server request is needed
        expect(mockSearchCompanyCardByNumber).not.toHaveBeenCalled();

        // When a formatted full number is entered
        await typeNumber(hook, '4111-1111 1111-1111');
        // Then the server receives the normalized number
        expect(mockSearchCompanyCardByNumber).toHaveBeenCalledWith(POLICY_ID, expect.any(String), FULL_NUMBER, FEED, DOMAIN_ACCOUNT_ID);
    });

    it('derives matched cardIDs and encrypted numbers for the current query, scoped to the feed', async () => {
        // Given a completed query whose response includes cards from multiple feeds
        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);
        const consumerID = getConsumerIDFromLastSearchCall();
        // When the response arrives for this consumer
        await seedResultsForConsumer(consumerID, FULL_NUMBER, [
            {feed: 'cdf', domainAccountID: 1, status: 'assigned', matchType: 'full', cardName: '411111XXXXXX1111', cardID: 42},
            {feed: 'cdf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: '411111XXXXXX1111', encryptedCardNumber: 'ENC_1111'},
            {feed: 'vcf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: '411111XXXXXX1111', encryptedCardNumber: 'ENC_OTHER_FEED'},
        ]);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then only identifiers from the selected feed are available to the caller
        expect(hook.result.current.resultsQuery).toBe(FULL_NUMBER);
        expect([...hook.result.current.matchedCardIDs]).toEqual([42]);
        expect([...hook.result.current.matchedEncryptedNumbers]).toEqual(['ENC_1111']);
    });

    it('ignores results that belong to a different query', async () => {
        // Given a consumer waiting for the current full-number query
        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);
        const consumerID = getConsumerIDFromLastSearchCall();
        // When a different query's results are present
        await seedResultsForConsumer(consumerID, '4000000000000000', [
            {feed: 'cdf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: 'x', encryptedCardNumber: 'ENC_STALE'},
        ]);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then callers cannot display those stale matches
        expect(hook.result.current.resultsQuery).toBeUndefined();
        expect(hook.result.current.matchedEncryptedNumbers.size).toBe(0);
    });

    it('clears the results on unmount', async () => {
        // Given a mounted search consumer
        const hook = await renderSearch();
        // When it leaves the screen
        hook.unmount();
        // Then its results are cleared without affecting another consumer
        expect(mockClearCompanyCardNumberSearch).toHaveBeenCalledWith(POLICY_ID, expect.any(String));
    });

    it('reports isFullNumberQuery only for 13-19 digit inputs, so callers can suppress local matches on formatted-number inputs', async () => {
        // Given a hook mounted on a policy
        const hook = await renderSearch();

        // When a non-digit query is typed
        await typeNumber(hook, 'Johns');
        // Then isFullNumberQuery is false (local tokenized search still applies)
        expect(hook.result.current.isFullNumberQuery).toBe(false);

        // When a formatted 16-digit number is typed
        await typeNumber(hook, '4111 1111 1111 1111');
        // Then isFullNumberQuery is true (callers must hide local matches that only collide on digit suffixes)
        expect(hook.result.current.isFullNumberQuery).toBe(true);
    });

    it('surfaces lastFourEncryptedNumbers so callers can annotate partial matches during assignment', async () => {
        // Given a hook mounted and a full-number query that the server resolves as a last-four-only match
        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);
        const consumerID = getConsumerIDFromLastSearchCall();
        // When the server can verify only the last four digits
        await seedResultsForConsumer(consumerID, FULL_NUMBER, [
            {feed: 'cdf', domainAccountID: 1, status: 'unassigned', matchType: 'lastFour', cardName: '555555XXXXXX1111', encryptedCardNumber: 'ENC_PARTIAL'},
        ]);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then the encryptedCardNumber appears in both matchedEncryptedNumbers and lastFourEncryptedNumbers so
        // callers can present the match and annotate it as "Matches last 4 digits only"
        expect([...hook.result.current.matchedEncryptedNumbers]).toEqual(['ENC_PARTIAL']);
        expect([...hook.result.current.lastFourEncryptedNumbers]).toEqual(['ENC_PARTIAL']);
    });

    it('scopes results so one consumer cannot erase another consumer on the same policy', async () => {
        // Given two independent consumers (table + assignment pane) mounted on the same policy
        const tableHook = await renderSearch();
        const paneHook = await renderSearch();

        // When the pane consumer runs a search and completes
        await typeNumber(paneHook, FULL_NUMBER);
        const paneConsumerID = getConsumerIDFromLastSearchCall();
        await seedResultsForConsumer(paneConsumerID, FULL_NUMBER, [{feed: 'cdf', domainAccountID: 1, status: 'assigned', matchType: 'full', cardName: '411111XXXXXX1111', cardID: 42}]);
        await act(async () => {
            await waitForBatchedUpdates();
        });
        expect(paneHook.result.current.resultsQuery).toBe(FULL_NUMBER);

        // When the table consumer's input is empty and then the table unmounts
        tableHook.unmount();

        // Then the pane consumer's completed results are untouched (its entry was not the one cleared)
        const paneEntry = await Onyx.get(`${PREFIX}${POLICY_ID}_${paneConsumerID}`);
        expect(paneEntry?.query).toBe(FULL_NUMBER);
        expect(paneEntry?.cards).toHaveLength(1);
    });

    it('does not resend the previous number while edits are waiting for debounce', async () => {
        // Given a full-number query that has already been dispatched
        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);
        mockSearchCompanyCardByNumber.mockClear();

        // When the user edits the number but the new debounce timer has not fired
        await act(async () => {
            hook.result.current.setSearchValue('4222222222222222');
            await waitForBatchedUpdates();
        });

        // Then neither the old number nor the new one is sent prematurely
        expect(mockSearchCompanyCardByNumber).not.toHaveBeenCalled();

        // When the new query finishes debouncing
        await act(async () => {
            jest.advanceTimersByTime(2000);
            await waitForBatchedUpdates();
        });

        // Then only the new number is sent
        expect(mockSearchCompanyCardByNumber).toHaveBeenCalledTimes(1);
        expect(mockSearchCompanyCardByNumber).toHaveBeenCalledWith(POLICY_ID, expect.any(String), '4222222222222222', FEED, DOMAIN_ACCOUNT_ID);
    });

    it('uses the server-returned card name as the identifier for unassigned direct-feed cards', async () => {
        // Given an unassigned direct-feed result without an encrypted identifier
        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);
        const consumerID = getConsumerIDFromLastSearchCall();

        // When the server returns a partial match identified by its card name
        await seedResultsForConsumer(consumerID, FULL_NUMBER, [{feed: FEED, domainAccountID: DOMAIN_ACCOUNT_ID, status: 'unassigned', matchType: 'lastFour', cardName: 'Direct card 1111'}]);

        // Then both consumers can match the local identifier and display the partial-match warning
        expect(hook.result.current.matchedEncryptedNumbers.has('Direct card 1111')).toBe(true);
        expect(hook.result.current.lastFourEncryptedNumbers.has('Direct card 1111')).toBe(true);
    });

    it('exposes failed searches separately from empty results and retries the current query', async () => {
        // Given a full-number query that failed rather than returning no cards
        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);
        const consumerID = getConsumerIDFromLastSearchCall();

        // When the failed response reaches the consumer
        await seedResultsForConsumer(consumerID, FULL_NUMBER, [], true);

        // Then the caller can show an error instead of an authoritative empty result
        expect(hook.result.current.hasError).toBe(true);
        expect(hook.result.current.resultsQuery).toBeUndefined();
        expect(hook.result.current.isSearching).toBe(false);

        // When the user explicitly retries without editing the input
        mockSearchCompanyCardByNumber.mockClear();
        act(() => hook.result.current.retrySearch());

        // Then the same normalized query is dispatched again
        expect(mockSearchCompanyCardByNumber).toHaveBeenCalledWith(POLICY_ID, consumerID, FULL_NUMBER, FEED, DOMAIN_ACCOUNT_ID);
    });
});
