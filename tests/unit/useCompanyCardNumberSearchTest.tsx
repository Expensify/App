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
    searchCompanyCardByNumber: (...args: unknown[]) => mockSearchCompanyCardByNumber(...args),
    clearCompanyCardNumberSearch: (...args: unknown[]) => mockClearCompanyCardNumberSearch(...args),
}));

const POLICY_ID = 'POLICY1';
const FEED = 'cdf' as CompanyCardFeedWithNumber;
const FULL_NUMBER = '4111111111111111';

const SEARCH_KEY = `${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARD_NUMBER_SEARCH}${POLICY_ID}` as const;

const seedResults = (query: string, cards: CompanyCardNumberSearchResult[]) => Onyx.set(SEARCH_KEY, {isLoading: false, query, cards});

const renderSearch = async (feed: CompanyCardFeedWithNumber | undefined = FEED, domainAccountID?: number) => {
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
        expect(mockSearchCompanyCardByNumber).toHaveBeenCalledWith(POLICY_ID, FULL_NUMBER, FEED, undefined);
    });

    it('derives matched cardIDs and encrypted numbers for the current query, scoped to the feed', async () => {
        await seedResults(FULL_NUMBER, [
            {feed: 'cdf', domainAccountID: 1, status: 'assigned', matchType: 'full', cardName: '411111XXXXXX1111', cardID: 42},
            {feed: 'cdf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: '411111XXXXXX1111', encryptedCardNumber: 'ENC_1111'},
            {feed: 'vcf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: '411111XXXXXX1111', encryptedCardNumber: 'ENC_OTHER_FEED'},
        ]);

        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);

        expect(hook.result.current.resultsQuery).toBe(FULL_NUMBER);
        expect([...hook.result.current.matchedCardIDs]).toEqual([42]);
        expect([...hook.result.current.matchedEncryptedNumbers]).toEqual(['ENC_1111']);
    });

    it('ignores results that belong to a different query', async () => {
        await seedResults('4000000000000000', [{feed: 'cdf', domainAccountID: 1, status: 'unassigned', matchType: 'full', cardName: 'x', encryptedCardNumber: 'ENC_STALE'}]);

        const hook = await renderSearch();
        await typeNumber(hook, FULL_NUMBER);

        expect(hook.result.current.resultsQuery).toBeUndefined();
        expect(hook.result.current.matchedEncryptedNumbers.size).toBe(0);
    });

    it('clears the results on unmount', async () => {
        const hook = await renderSearch();
        hook.unmount();
        expect(mockClearCompanyCardNumberSearch).toHaveBeenCalledWith(POLICY_ID);
    });
});
