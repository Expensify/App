import * as PersistedRequests from '@libs/actions/PersistedRequests';
import {getWiseQuote} from '@libs/actions/Wise';
import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

function getSentQuoteRequest(mockFetch: MockFetch): FormData | undefined {
    const [url, options] = mockFetch.mock.calls.at(-1) ?? [];
    if (typeof url !== 'string' || !url.includes('GetWiseQuote')) {
        return undefined;
    }
    return options?.body instanceof FormData ? options.body : undefined;
}

describe('actions/Wise getWiseQuote', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    let mockFetch: MockFetch;
    beforeEach(async () => {
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;
        setHasRadio(true);
        PersistedRequests.clear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('prices only the unheld expenses from the chosen bank account when the admin pays only those', async () => {
        // Given a report paid from a chosen bank account with its held expenses left out, as the hold menu's "Pay only" does
        getWiseQuote('123', {full: false, paymentType: CONST.IOU.PAYMENT_TYPE.VBBA, methodID: 42});
        await waitForBatchedUpdates();
        await waitForNetworkPromises();

        // Then the quote is asked for the same payment
        const request = getSentQuoteRequest(mockFetch);
        expect(request?.get('reportID')).toBe('123');
        expect(request?.get('full')).toBe('false');
        expect(request?.get('bankAccountID')).toBe('42');
    });

    it('prices the whole report from the workspace account by default', async () => {
        // Given a report paid in full without a chosen bank account
        getWiseQuote('123', {paymentType: CONST.IOU.PAYMENT_TYPE.VBBA});
        await waitForBatchedUpdates();
        await waitForNetworkPromises();

        // Then the server picks the workspace account and prices every expense
        const request = getSentQuoteRequest(mockFetch);
        expect(request?.get('full')).toBe('true');
        expect(request?.has('bankAccountID')).toBe(false);
    });
});
