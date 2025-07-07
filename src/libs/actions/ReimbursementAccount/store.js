"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCreditBankAccount = hasCreditBankAccount;
var react_native_onyx_1 = require("react-native-onyx");
var BankAccount_1 = require("@libs/models/BankAccount");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var bankAccountList;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.BANK_ACCOUNT_LIST,
    callback: function (val) {
        bankAccountList = val;
    },
});
function hasCreditBankAccount() {
    if (!bankAccountList) {
        return false;
    }
    return Object.values(bankAccountList).some(function (bankAccountJSON) {
        var bankAccount = new BankAccount_1.default(bankAccountJSON);
        return bankAccount.isDefaultCredit();
    });
}
exports.default = { hasCreditBankAccount: hasCreditBankAccount };
