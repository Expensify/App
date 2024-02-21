import CONST from '../../src/CONST';
import * as paymentUtils from '../../src/libs/PaymentUtils';

describe('PaymentUtils', () => {
    it('Test rounding wallet transfer instant fee', () => {
        expect(paymentUtils.calculateWalletTransferBalanceFee(2100, CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT)).toBe(32);
    });
});
