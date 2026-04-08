import Onyx from 'react-native-onyx';
import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod} from '@src/types/onyx';
import {openSubscriptionPage} from '../../src/libs/actions/Subscription';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
const mockRead = jest.mocked(read);

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
            const onyxData = call?.at(2) as Parameters<typeof mockRead>[2];

            // optimisticData should only have the loading key
            expect(onyxData?.optimisticData).toHaveLength(1);
            expect(onyxData?.optimisticData?.[0]?.key).toBe(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);

            // failureData should only have the loading key
            expect(onyxData?.failureData).toHaveLength(1);
            expect(onyxData?.failureData?.[0]?.key).toBe(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);
        });

        it('should not include grace period data when collection is empty', () => {
            openSubscriptionPage({});

            const call = mockRead.mock.calls.at(0);
            const onyxData = call?.at(2) as Parameters<typeof mockRead>[2];

            // optimisticData should only have the loading key
            expect(onyxData?.optimisticData).toHaveLength(1);
            expect(onyxData?.optimisticData?.[0]?.key).toBe(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);

            // failureData should only have the loading key
            expect(onyxData?.failureData).toHaveLength(1);
            expect(onyxData?.failureData?.[0]?.key).toBe(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);
        });
    });
});
