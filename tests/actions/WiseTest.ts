import asyncOpenURL from '@libs/asyncOpenURL';

import {openWiseKYCReviewForm} from '@userActions/Wise';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const BANK_ACCOUNT_ID = 9053192;

jest.mock('@libs/asyncOpenURL', () => jest.fn());

describe('actions/Wise', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('marks the link as loading while it is fetched', async () => {
        // Given no link fetch in flight

        // When the user asks for Wise's form
        openWiseKYCReviewForm(BANK_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the link is loading, so Continue cannot start a second fetch
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({isLoading: true});
    });

    it("redirects to Wise's form for the bank account in the same tab once the link arrives", async () => {
        // Given the user asked for Wise's form
        jest.useFakeTimers();
        openWiseKYCReviewForm(BANK_ACCOUNT_ID);
        const [linkPromise, getURL, shouldSkipCustomSafariLogic, shouldOpenInSameTab] = jest.mocked(asyncOpenURL).mock.calls.at(0) ?? [];

        // When the link arrives
        jest.runAllTimers();
        const link = await linkPromise;
        await waitForBatchedUpdates();

        // Then the user leaves for the form tied to the bank account, and the link is no longer loading
        expect(typeof getURL === 'function' ? getURL(link) : getURL).toContain(`bankAccountID=${BANK_ACCOUNT_ID}`);
        expect(shouldSkipCustomSafariLogic).toBeUndefined();
        expect(shouldOpenInSameTab).toBe(true);
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({isLoading: false});
    });
});
