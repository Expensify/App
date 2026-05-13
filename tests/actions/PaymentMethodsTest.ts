import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {transferWalletBalance} from '@libs/actions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

const writeSpy = jest.spyOn(API, 'write');

describe('actions/PaymentMethods', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('optimistically clears wallet balance when transferring wallet funds', () => {
        const paymentMethod: PaymentMethod = {
            methodID: 1,
            accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        } as PaymentMethod;

        transferWalletBalance(paymentMethod);

        const [, , onyxData] = writeSpy.mock.calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.WALLET_TRANSFER | typeof ONYXKEYS.USER_WALLET>];

        expect(onyxData.optimisticData).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    key: ONYXKEYS.USER_WALLET,
                    value: expect.objectContaining({
                        currentBalance: 0,
                        availableBalance: 0,
                    }),
                }),
            ]),
        );
    });
});
