import CONST from '../../src/CONST';

const paymentUtils = require('../../src/libs/PaymentUtils');

describe('PaymentUtils', () => {
    it('Test rounding wallet transfer instant fee', () => {
        expect(paymentUtils.calculateWalletTransferBalanceFee(2100, CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT)).toBe(32);
    });
});
