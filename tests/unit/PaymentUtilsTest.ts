import CONST from '@src/CONST';
import {calculateWalletTransferBalanceFee} from '@src/libs/PaymentUtils';

describe('PaymentUtils', () => {
    it('Test rounding wallet transfer instant fee', () => {
        expect(calculateWalletTransferBalanceFee(2100, CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT)).toBe(32);
    });
});
