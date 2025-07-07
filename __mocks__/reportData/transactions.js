"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionR98765 = exports.transactionR14932 = void 0;
var CONST_1 = require("@src/CONST");
var amount = 10402;
var currency = CONST_1.default.CURRENCY.USD;
var REPORT_ID_R14932 = 'REPORT_ID_R14932';
var TRANSACTION_ID_R14932 = 'TRANSACTION_ID_R14932';
var REPORT_ID_R98765 = 'REPORT_ID_R98765';
var TRANSACTION_ID_R98765 = 'TRANSACTION_ID_R98765';
var receiptR14932 = {
    state: CONST_1.default.IOU.RECEIPT_STATE.OPEN,
    source: 'mockData/eReceiptBGs/eReceiptBG_pink.png',
};
var transactionR14932 = {
    amount: amount,
    currency: currency,
    cardName: CONST_1.default.EXPENSE.TYPE.CASH_CARD_NAME,
    transactionID: TRANSACTION_ID_R14932,
    reportID: REPORT_ID_R14932,
    status: CONST_1.default.TRANSACTION.STATUS.POSTED,
    receipt: receiptR14932,
    merchant: 'Acme',
    filename: 'test.html',
    created: '2025-02-14',
    inserted: '2025-02-14 08:12:19',
    billable: false,
    managedCard: false,
    reimbursable: true,
    hasEReceipt: true,
    cardID: 0,
    modifiedAmount: 0,
    originalAmount: 0,
    comment: {},
    bank: '',
    cardNumber: '',
    category: '',
    modifiedCreated: '',
    modifiedCurrency: '',
    modifiedMerchant: '',
    originalCurrency: '',
    parentTransactionID: '',
    posted: '',
    tag: '',
};
exports.transactionR14932 = transactionR14932;
var transactionR98765 = {
    currency: currency,
    amount: amount,
    transactionID: TRANSACTION_ID_R98765,
    reportID: REPORT_ID_R98765,
    status: CONST_1.default.TRANSACTION.STATUS.POSTED,
    cardName: CONST_1.default.EXPENSE.TYPE.CASH_CARD_NAME,
    created: '2025-02-14',
    inserted: '2025-02-14 08:12:19',
    merchant: 'Acme',
    reimbursable: true,
    hasEReceipt: true,
    managedCard: false,
    billable: false,
    modifiedAmount: 0,
    cardID: 0,
    originalAmount: 0,
    comment: {},
    bank: '',
    cardNumber: '',
    category: '',
    filename: '',
    modifiedCreated: '',
    modifiedCurrency: '',
    modifiedMerchant: '',
    originalCurrency: '',
    parentTransactionID: '',
    posted: '',
    tag: '',
};
exports.transactionR98765 = transactionR98765;
