import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {BillingGraceEndPeriod} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {clearOutstandingBalance, openSubscriptionPage} from '../../src/libs/actions/Subscription';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
const mockRead = jest.mocked(read);
const mockWrite = jest.mocked(write);

describe('actions/Subscription', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();

        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('openSubscriptionPage', () => {
        it('should call API.read with loading optimistic/success/failure data when no grace periods are provided', () => {
            openSubscriptionPage();

            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE,
                null,
                expect.objectContaining({
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
                            value: true,
                        },
                    ],
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
                            value: false,
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
                            value: false,
                        },
                    ],
                }),
            );
        });

        it('should clear all grace period keys optimistically and restore on failure', () => {
            const gracePeriod1: BillingGraceEndPeriod = {value: 1700000000};
            const gracePeriod2: BillingGraceEndPeriod = {value: 1700099999};
            const key1 = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}11111`;
            const key2 = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}22222`;

            openSubscriptionPage({
                [key1]: gracePeriod1,
                [key2]: gracePeriod2,
            });

            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE,
                null,
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
                            value: true,
                        },
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: key1,
                            value: null,
                        },
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: key2,
                            value: null,
                        },
                    ]),
                    failureData: expect.arrayContaining([
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
                            value: false,
                        },
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: key1,
                            value: gracePeriod1,
                        },
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: key2,
                            value: gracePeriod2,
                        },
                    ]),
                }),
            );
        });

        it('should handle undefined values in the grace period collection by rolling back to null', () => {
            const key1 = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}33333`;

            openSubscriptionPage({
                [key1]: undefined,
            });

            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE,
                null,
                expect.objectContaining({
                    failureData: expect.arrayContaining([
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: key1,
                            value: null,
                        },
                    ]),
                }),
            );
        });

        it('should not include grace period data when collection is undefined', () => {
            openSubscriptionPage(undefined);

            const call = mockRead.mock.calls.at(0);
            if (!call) {
                throw new Error('Expected openSubscriptionPage to make an API read call');
            }
            const onyxData = call[2];
            const optimisticUpdate = onyxData.optimisticData?.at(0);
            const failureUpdate = onyxData.failureData?.at(0);
            if (!optimisticUpdate || !failureUpdate) {
                throw new Error('Expected the API read call to include optimistic and failure updates');
            }

            // optimisticData should only have the loading key
            expect(onyxData.optimisticData).toHaveLength(1);
            expect(optimisticUpdate.key).toBe(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);

            // failureData should only have the loading key
            expect(onyxData.failureData).toHaveLength(1);
            expect(failureUpdate.key).toBe(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);
        });

        it('should not include grace period data when collection is empty', () => {
            openSubscriptionPage({});

            const call = mockRead.mock.calls.at(0);
            if (!call) {
                throw new Error('Expected openSubscriptionPage to make an API read call');
            }
            const onyxData = call[2];
            const optimisticUpdate = onyxData.optimisticData?.at(0);
            const failureUpdate = onyxData.failureData?.at(0);
            if (!optimisticUpdate || !failureUpdate) {
                throw new Error('Expected the API read call to include optimistic and failure updates');
            }

            // optimisticData should only have the loading key
            expect(onyxData.optimisticData).toHaveLength(1);
            expect(optimisticUpdate.key).toBe(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);

            // failureData should only have the loading key
            expect(onyxData.failureData).toHaveLength(1);
            expect(failureUpdate.key).toBe(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);
        });
    });

    describe('clearOutstandingBalance', () => {
        it('pairs the 3DS source with the failure response, where an SCA retry delivers its link', async () => {
            // Given an earlier 3DS attempt left its link in Onyx
            await Onyx.set(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION, 'https://hooks.stripe.com/3d_secure_2/previous');

            // When Retry payment fires from Subscription
            clearOutstandingBalance(SCREENS.SETTINGS.SUBSCRIPTION.ROOT);
            await waitForBatchedUpdates();

            // Then the old link is cleared, so a byte-identical link in the response still registers as a change
            expect(await getOnyxValue(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION)).toBe('');

            // And the source is recorded in failureData, because a charge that needs 3DS comes back as a 409
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.CLEAR_OUTSTANDING_BALANCE,
                null,
                expect.objectContaining({
                    failureData: expect.arrayContaining([
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: ONYXKEYS.VERIFY_3DS_SUBSCRIPTION_SOURCE,
                            value: SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
                        },
                    ]),
                }),
            );
        });
    });
});
