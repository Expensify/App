import {READ_COMMANDS} from '@libs/API/types';

import {getWiseKYCReviewEmbeddedLink} from '@userActions/Wise';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const BANK_ACCOUNT_ID = 9053192;
const LINK = 'https://sandbox.transferwise.tech/embedded-flows/kyc-review?token=abc';
const EXPIRES_AT = '2026-11-02 15:00:00';
const ERROR_KEY = 1793631091391000;

describe('actions/Wise', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    // The server answers with the link in Onyx, the way the command is documented
    function respondWithLink() {
        mockFetch.mockAPICommand(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, () => ({
            onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, value: {url: LINK, expiresAt: EXPIRES_AT}}],
        }));
    }

    beforeEach(() => {
        mockFetch.mockClear();
        mockFetch.succeed();
        mockFetch.mockAPICommand(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, () => ({}));
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => mockFetch.resume());

    it('asks for the link of the bank account and marks it as loading', async () => {
        // Given a request that has not been answered yet
        mockFetch.pause();

        // When the link is requested
        getWiseKYCReviewEmbeddedLink(BANK_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the command goes out for the bank account, since Wise's form is tied to it
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK), expect.anything());
        const body = mockFetch.mock.calls.at(0)?.[1]?.body;
        expect(body instanceof FormData ? body.get('bankAccountID') : undefined).toBe(String(BANK_ACCOUNT_ID));

        // And the link is loading, so Continue cannot start a second fetch
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({isLoading: true});
    });

    it('keeps the link the server sends and stops loading', async () => {
        // Given the server answers with a link
        respondWithLink();

        // When the link is requested
        getWiseKYCReviewEmbeddedLink(BANK_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the page has the link to redirect to
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({url: LINK, expiresAt: EXPIRES_AT, isLoading: false});
    });

    it('drops the previous link and error when a new link is requested', async () => {
        // Given a link and an error left from an earlier request
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {url: LINK, errors: {[ERROR_KEY]: 'error'}});
        mockFetch.pause();

        // When a new link is requested
        getWiseKYCReviewEmbeddedLink(BANK_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then only the loading state is left, since an old link is short-lived and must not redirect
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({isLoading: true});
    });

    it('shows an error when there is no link', async () => {
        // Given the server fails, as when there is no open review
        mockFetch.fail();

        // When the link is requested
        getWiseKYCReviewEmbeddedLink(BANK_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the page can show an error and let the user try again
        const link = await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK);
        expect(link?.isLoading).toBe(false);
        expect(link?.url).toBeUndefined();
        expect(Object.keys(link?.errors ?? {})).toHaveLength(1);
    });
});
