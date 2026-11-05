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

const seedResultsForConsumer = (consumerID: string, query: string, cards: CompanyCardNumberSearchResult[]) =>
    act(async () => {
        await Onyx.set(`${PREFIX}${POLICY_ID}_${consumerID}`, {isLoading: false, query, cards});
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
        const hook = await renderSearch();

        await typeNumber(hook, '4111');
        expect(mockSearchCompanyCardByNumber).not.toHaveBeenCalled();

        await typeNumber(hook, '4111-1111 1111-1111');
        expect(mockSearchCompanyCardByNumber).toHaveBeenCalledWith(POLICY_ID, expect.any(String), FULL_NUMBER, FEED, DOMAIN_ACCOUNT_ID);
    });

    it('derives matched cardIDs and encrypted numbers for the current query, scoped to the feed', async () => {
        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);
        const consumerID = getConsumerIDFromLastSearchCall();
        await seedResultsForConsumer(consumerID, FULL_NUMBER, [
            {feed: 'cdf', domainAccountID: 1, status: 'assigned', matchType: 'full', cardName: '411111XXXXXX1111', cardID: 42},
            {feed: 'cdf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: '411111XXXXXX1111', encryptedCardNumber: 'ENC_1111'},
            {feed: 'vcf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: '411111XXXXXX1111', encryptedCardNumber: 'ENC_OTHER_FEED'},
        ]);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(hook.result.current.resultsQuery).toBe(FULL_NUMBER);
        expect([...hook.result.current.matchedCardIDs]).toEqual([42]);
        expect([...hook.result.current.matchedEncryptedNumbers]).toEqual(['ENC_1111']);
    });

    it('ignores results that belong to a different query', async () => {
        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);
        const consumerID = getConsumerIDFromLastSearchCall();
        await seedResultsForConsumer(consumerID, '4000000000000000', [
            {feed: 'cdf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: 'x', encryptedCardNumber: 'ENC_STALE'},
        ]);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(hook.result.current.resultsQuery).toBeUndefined();
        expect(hook.result.current.matchedEncryptedNumbers.size).toBe(0);
    });

    it('clears the results on unmount', async () => {
        const hook = await renderSearch();
        hook.unmount();
        expect(mockClearCompanyCardNumberSearch).toHaveBeenCalledWith(POLICY_ID, expect.any(String));
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
});
