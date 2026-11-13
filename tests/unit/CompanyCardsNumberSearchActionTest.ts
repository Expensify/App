/* eslint-disable rulesdir/no-multiple-api-calls -- the two search invocations here are the subject of an out-of-order regression test, not chained production API calls. */
import {clearCompanyCardNumberSearch, searchCompanyCardByNumber} from '@libs/actions/CompanyCards';
import * as API from '@libs/API';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {CompanyCardNumberSearchResult} from '@src/types/onyx/CompanyCardNumberSearch';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
}));

const mockMakeRequestWithSideEffects = jest.mocked(API.makeRequestWithSideEffects);

const POLICY_ID = 'POLICY1';
const CONSUMER_ID = 'consumerA';
const FEED = 'cdf' as CompanyCardFeedWithNumber;
const DOMAIN_ACCOUNT_ID = 1;
const KEY = `${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARD_NUMBER_SEARCH}${POLICY_ID}_${CONSUMER_ID}` as const;

const cardFor = (query: string): CompanyCardNumberSearchResult => ({
    feed: 'cdf',
    domainAccountID: DOMAIN_ACCOUNT_ID,
    status: 'assigned',
    matchType: 'full',
    cardName: 'x',
    cardID: Number(query.slice(-4)),
});

type SearchResponse = {jsonCode: number; cards: CompanyCardNumberSearchResult[]};
type DeferredResponse = {promise: Promise<SearchResponse>; resolve: (value: SearchResponse) => void};
const makeDeferred = (): DeferredResponse => {
    let resolve: (value: SearchResponse) => void = () => {};
    const promise = new Promise<SearchResponse>((res) => {
        resolve = res;
    });
    return {promise, resolve};
};

describe('searchCompanyCardByNumber superseded-response handling', () => {
    beforeEach(() => {
        mockMakeRequestWithSideEffects.mockReset();
        return Onyx.clear();
    });

    it('drops an older response that resolves after a newer request so the newer results win', async () => {
        // Given two searches started in order (older first, newer second) whose responses arrive out of order
        const first = makeDeferred();
        const second = makeDeferred();
        mockMakeRequestWithSideEffects.mockReturnValueOnce(first.promise);
        mockMakeRequestWithSideEffects.mockReturnValueOnce(second.promise);

        const olderPromise = searchCompanyCardByNumber(POLICY_ID, CONSUMER_ID, '4111111111111111', FEED, DOMAIN_ACCOUNT_ID);
        const newerPromise = searchCompanyCardByNumber(POLICY_ID, CONSUMER_ID, '4222222222222222', FEED, DOMAIN_ACCOUNT_ID);

        // When the newer response resolves before the older one
        second.resolve({jsonCode: 200, cards: [cardFor('4222222222222222')]});
        await newerPromise;
        await waitForBatchedUpdates();
        first.resolve({jsonCode: 200, cards: [cardFor('4111111111111111')]});
        await olderPromise;
        await waitForBatchedUpdates();

        // Then the entry reflects the newer query, not the older one
        const entry = await Onyx.get(KEY);
        expect(entry?.query).toBe('4222222222222222');
        expect(entry?.cards?.at(0)?.cardID).toBe(2222);
    });

    it('invalidates an in-flight request when the consumer clears so a late response cannot restore results', async () => {
        // Given a search in flight that is then cleared by the consumer
        const inFlight = makeDeferred();
        mockMakeRequestWithSideEffects.mockReturnValueOnce(inFlight.promise);
        const requestPromise = searchCompanyCardByNumber(POLICY_ID, CONSUMER_ID, '4111111111111111', FEED, DOMAIN_ACCOUNT_ID);
        clearCompanyCardNumberSearch(POLICY_ID, CONSUMER_ID);
        await waitForBatchedUpdates();

        // When the late response finally arrives
        inFlight.resolve({jsonCode: 200, cards: [cardFor('4111111111111111')]});
        await requestPromise;
        await waitForBatchedUpdates();

        // Then the cleared state stays empty
        const entry = await Onyx.get(KEY);
        expect(entry).toBeUndefined();
    });

    it('keeps the card number out of optimistic data logged by the API layer', async () => {
        // Given a successful full-number lookup
        const cardNumber = '4111111111111111';
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

        // When the search is submitted
        await searchCompanyCardByNumber(POLICY_ID, CONSUMER_ID, cardNumber, FEED, DOMAIN_ACCOUNT_ID);

        // Then only the sanitized request parameter contains the number, not the logged optimistic payload
        const [, params, onyxData] = mockMakeRequestWithSideEffects.mock.calls.at(-1) ?? [];
        expect(params).toHaveProperty('cardNumber', cardNumber);
        expect(JSON.stringify(onyxData)).not.toContain(cardNumber);
    });

    it('distinguishes a rejected request from a successful empty result', async () => {
        // Given a network failure rather than a successful lookup
        mockMakeRequestWithSideEffects.mockRejectedValue(new Error('Network unavailable'));

        // When the failure is handled
        await searchCompanyCardByNumber(POLICY_ID, CONSUMER_ID, '4111111111111111', FEED, DOMAIN_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then consumers receive an explicit error state and can offer retry
        expect(await Onyx.get(KEY)).toMatchObject({isLoading: false, hasError: true, cards: []});
    });

    it('treats an unsuccessful API response as an error even when the promise resolves', async () => {
        // Given a server-side failure returned as a response
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 500});

        // When the response is handled
        await searchCompanyCardByNumber(POLICY_ID, CONSUMER_ID, '4111111111111111', FEED, DOMAIN_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then it is not presented as an empty successful search
        expect(await Onyx.get(KEY)).toMatchObject({hasError: true, isLoading: false});
    });

    it('clears the previous error when a retry successfully returns no cards', async () => {
        // Given a previous failure for this consumer
        await Onyx.set(KEY, {query: '4111111111111111', isLoading: false, hasError: true, cards: []});
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

        // When retry succeeds with an empty response
        await searchCompanyCardByNumber(POLICY_ID, CONSUMER_ID, '4111111111111111', FEED, DOMAIN_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the empty result is explicitly successful
        expect(await Onyx.get(KEY)).toMatchObject({hasError: false, isLoading: false, cards: []});
    });
});
