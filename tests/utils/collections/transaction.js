"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createRandomTransaction;
var falso_1 = require("@ngneat/falso");
var date_fns_1 = require("date-fns");
var CONST_1 = require("@src/CONST");
function createRandomTransaction(index) {
    var _a;
    return {
        amount: (0, falso_1.randAmount)(),
        bank: (0, falso_1.randWord)(),
        cardID: (0, falso_1.randNumber)(),
        cardName: (0, falso_1.randWord)(),
        cardNumber: (0, falso_1.randWord)(),
        billable: (0, falso_1.randBoolean)(),
        category: (0, falso_1.randWord)(),
        comment: {
            comment: (0, falso_1.randWord)(),
            waypoints: (_a = {},
                _a[(0, falso_1.randWord)()] = {
                    address: (0, falso_1.randWord)(),
                    lat: index,
                    lng: index,
                    name: (0, falso_1.randWord)(),
                },
                _a),
            attendees: [{ email: (0, falso_1.randWord)(), displayName: 'Test User', avatarUrl: '' }],
        },
        filename: (0, falso_1.randWord)(),
        managedCard: (0, falso_1.randBoolean)(),
        created: (0, date_fns_1.format)((0, falso_1.randPastDate)(), CONST_1.default.DATE.FNS_DB_FORMAT_STRING),
        modifiedCreated: '',
        currency: CONST_1.default.CURRENCY.USD,
        modifiedCurrency: '',
        merchant: (0, falso_1.randWord)(),
        modifiedMerchant: (0, falso_1.randWord)(),
        originalAmount: (0, falso_1.randAmount)(),
        originalCurrency: (0, falso_1.rand)(Object.values(CONST_1.default.CURRENCY)),
        reportID: index.toString(),
        transactionID: index.toString(),
        tag: (0, falso_1.randWord)(),
        parentTransactionID: index.toString(),
        status: (0, falso_1.rand)(Object.values(CONST_1.default.TRANSACTION.STATUS)),
        receipt: {},
        reimbursable: (0, falso_1.randBoolean)(),
        hasEReceipt: (0, falso_1.randBoolean)(),
        modifiedAmount: 0,
    };
}
