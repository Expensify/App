import {WRITE_COMMANDS} from '@libs/API/types';
import Growl from '@libs/Growl';
import HandleBalancePaymentInProgress from '@libs/Middleware/HandleBalancePaymentInProgress';

import CONST from '@src/CONST';
import en from '@src/languages/en';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';

type BillingRetryKey = typeof ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING | typeof ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED;

describe('HandleBalancePaymentInProgress middleware', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

    afterEach(() => jest.restoreAllMocks());

    it.each([
        {jsonCode: CONST.JSON_CODE.ACCOUNT_BILLING_IN_PROGRESS, shouldShowProgress: true},
        {jsonCode: CONST.JSON_CODE.EXP_ERROR, shouldShowProgress: false},
    ])('handles balance retry response $jsonCode', async ({jsonCode, shouldShowProgress}) => {
        // Given a queued balance retry that stops loading and marks a failure on error.
        const showGrowl = jest.spyOn(Growl, 'show').mockImplementation(() => {});
        const request: Request<BillingRetryKey> = {
            command: WRITE_COMMANDS.CLEAR_OUTSTANDING_BALANCE,
            data: {},
            failureData: [
                {onyxMethod: 'merge', key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING, value: false},
                {onyxMethod: 'merge', key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED, value: true},
            ],
        };
        const response = {jsonCode};

        // When the middleware receives the balance retry response.
        const result = await HandleBalancePaymentInProgress(Promise.resolve(response), request, true);

        // Then only an in-progress response replaces the failure feedback with a notification.
        expect(result).toBe(response);
        expect(request.failureData?.find((update) => update.key === ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING)?.value).toBe(false);
        expect(request.failureData?.find((update) => update.key === ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED)?.value).toBe(!shouldShowProgress);
        if (shouldShowProgress) {
            expect(showGrowl).toHaveBeenCalledWith({type: CONST.GROWL.WARNING, bodyText: en.subscription.billingBanner.retryBillingInProgress});

            // When the response is handled again after reauthentication.
            await HandleBalancePaymentInProgress(Promise.resolve(response), request, true);

            // Then the user sees the notification once.
            expect(showGrowl).toHaveBeenCalledTimes(1);
        } else {
            expect(showGrowl).not.toHaveBeenCalled();
        }
    });
});
