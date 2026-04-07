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
        it('should call API.read with loading optimistic/success/failure data when no ownerAccountID is provided', () => {
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

        it('should include grace period optimistic clear and failure rollback when ownerAccountID is provided', () => {
            const ownerAccountID = 12345;
            const currentGracePeriod: BillingGraceEndPeriod = {value: 1700000000};
            const gracePeriodKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}${ownerAccountID}`;

            openSubscriptionPage(ownerAccountID, currentGracePeriod);

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
                            key: gracePeriodKey,
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
                            key: gracePeriodKey,
                            value: currentGracePeriod,
                        },
                    ]),
                }),
            );
        });

        it('should set failure rollback value to null when currentGracePeriod is undefined', () => {
            const ownerAccountID = 99999;
            const gracePeriodKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}${ownerAccountID}`;

            openSubscriptionPage(ownerAccountID, undefined);

            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE,
                null,
                expect.objectContaining({
                    failureData: expect.arrayContaining([
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: gracePeriodKey,
                            value: null,
                        },
                    ]),
                }),
            );
        });

        it('should not include grace period data when ownerAccountID is 0 (falsy)', () => {
            openSubscriptionPage(0);

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
