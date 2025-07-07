"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var PaymentUtils_1 = require("@src/libs/PaymentUtils");
describe('PaymentUtils', function () {
    it('Test rounding wallet transfer instant fee', function () {
        expect((0, PaymentUtils_1.calculateWalletTransferBalanceFee)(2100, CONST_1.default.WALLET.TRANSFER_METHOD_TYPE.INSTANT)).toBe(32);
    });
});
