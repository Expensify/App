"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var CONST_1 = require("@src/CONST");
var BankAccount = /** @class */ (function () {
    function BankAccount(accountJSON) {
        this.json = accountJSON;
    }
    /**
     * Return the ID of the reimbursement account
     */
    BankAccount.prototype.getID = function () {
        return this.json.methodID;
    };
    /**
     * Return the account number, which has been obfuscated by the back end
     * example "XXXXXX3956"
     */
    BankAccount.prototype.getMaskedAccountNumber = function () {
        var _a;
        return (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.accountNumber;
    };
    /**
     * Used as the display name for the account...
     */
    BankAccount.prototype.getAddressName = function () {
        var _a;
        return (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.addressName;
    };
    BankAccount.prototype.getProcessor = function () {
        var _a;
        return (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.processor;
    };
    BankAccount.prototype.getRoutingNumber = function () {
        var _a;
        return (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.routingNumber;
    };
    /**
     * Get all user emails that have access to this bank account
     */
    BankAccount.prototype.getSharees = function () {
        var _a;
        return (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.sharees;
    };
    BankAccount.prototype.getState = function () {
        var _a;
        return (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.state;
    };
    BankAccount.prototype.isOpen = function () {
        return this.getState() === BankAccount.STATE.OPEN;
    };
    /**
     * @deprecated Use !isPending instead.
     */
    BankAccount.prototype.isVerified = function () {
        return !this.isPending();
    };
    /**
     * If the user still needs to enter the 3 micro deposit amounts.
     */
    BankAccount.prototype.isPending = function () {
        return this.getState() === BankAccount.STATE.PENDING;
    };
    /**
     * If success team is currently verifying the bank account data provided by the user.
     */
    BankAccount.prototype.isVerifying = function () {
        return this.getState() === BankAccount.STATE.VERIFYING;
    };
    /**
     * If the user didn't finish entering all their info.
     */
    BankAccount.prototype.isInSetup = function () {
        return this.getState() === BankAccount.STATE.SETUP;
    };
    BankAccount.prototype.isLocked = function () {
        return this.getState() === BankAccount.STATE.LOCKED;
    };
    /**
     * Is it the account to use by default to receive money?
     */
    BankAccount.prototype.isDefaultCredit = function () {
        var _a;
        return ((_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.defaultCredit) === true;
    };
    /**
     * Can we use this account to pay other people?
     */
    BankAccount.prototype.isWithdrawal = function () {
        var _a;
        return ((_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.allowDebit) === true;
    };
    BankAccount.prototype.getType = function () {
        var _a;
        return (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.type;
    };
    /**
     * Return the client ID of this bank account
     *
     * @NOTE WARNING KEEP IN SYNC WITH THE PHP
     */
    BankAccount.prototype.getClientID = function () {
        var _a, _b, _c;
        // eslint-disable-next-line max-len
        return "".concat(expensify_common_1.Str.makeID((_a = this.getMaskedAccountNumber()) !== null && _a !== void 0 ? _a : '')).concat(expensify_common_1.Str.makeID((_b = this.getAddressName()) !== null && _b !== void 0 ? _b : '')).concat(expensify_common_1.Str.makeID((_c = this.getRoutingNumber()) !== null && _c !== void 0 ? _c : '')).concat(this.getTransactionType());
    };
    BankAccount.prototype.getTransactionType = function () {
        return this.isWithdrawal() ? 'withdrawal' : 'direct-deposit';
    };
    /**
     * Return the internal json data structure used by auth
     */
    BankAccount.prototype.getJSON = function () {
        return this.json;
    };
    /**
     * Return whether this bank account has been risk checked
     */
    BankAccount.prototype.isRiskChecked = function () {
        var _a;
        return !!((_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.riskChecked);
    };
    /**
     * Return when the 3 micro amounts for validation were supposed to reach the bank account.
     */
    BankAccount.prototype.getValidateCodeExpectedDate = function () {
        var _a;
        return (_a = this.json.validateCodeExpectedDate) !== null && _a !== void 0 ? _a : '';
    };
    /**
     * In which country is the bank account?
     */
    BankAccount.prototype.getCountry = function () {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.country) !== null && _c !== void 0 ? _c : CONST_1.default.COUNTRY.US;
    };
    /**
     * In which currency is the bank account?
     */
    BankAccount.prototype.getCurrency = function () {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.currency) !== null && _c !== void 0 ? _c : 'USD';
    };
    /**
     * In which bank is the bank account?
     */
    BankAccount.prototype.getBankName = function () {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.bankName) !== null && _c !== void 0 ? _c : '';
    };
    /**
     * Did we get bank account details for local transfer or international wire?
     */
    BankAccount.prototype.hasInternationalWireDetails = function () {
        var _a, _b, _c;
        return ((_c = (_b = (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.fieldsType) !== null && _c !== void 0 ? _c : 'local') === 'international';
    };
    /**
     * Get the additional data of a bankAccount
     */
    BankAccount.prototype.getAdditionalData = function () {
        var _a, _b;
        return (_b = (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) !== null && _b !== void 0 ? _b : {};
    };
    /**
     * Get the pending action of the bank account
     */
    BankAccount.prototype.getPendingAction = function () {
        var _a;
        return (_a = this.json.pendingAction) !== null && _a !== void 0 ? _a : '';
    };
    /**
     * Return a map needed to set up a withdrawal account
     */
    BankAccount.prototype.toACHData = function () {
        return __assign({ routingNumber: this.getRoutingNumber(), accountNumber: this.getMaskedAccountNumber(), addressName: this.getAddressName(), isSavings: this.json.isSavings, bankAccountID: this.getID(), state: this.getState(), validateCodeExpectedDate: this.getValidateCodeExpectedDate(), needsToUpgrade: this.needsToUpgrade() }, this.getAdditionalData());
    };
    /**
     * Check if user hasn't upgraded their bank account yet.
     */
    BankAccount.prototype.needsToUpgrade = function () {
        var _a, _b;
        return !this.isInSetup() && ((_b = (_a = this.json.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.beneficialOwners) === undefined;
    };
    BankAccount.STATE = {
        PENDING: 'PENDING',
        OPEN: 'OPEN',
        DELETED: 'DELETED',
        LOCKED: 'LOCKED',
        SETUP: 'SETUP',
        VERIFYING: 'VERIFYING',
    };
    return BankAccount;
}());
exports.default = BankAccount;
