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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_native_onyx_1 = require("react-native-onyx");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var billingGraceEndPeriod = {
    value: 0,
};
var GRACE_PERIOD_DATE = new Date().getTime() + 1000 * 3600;
var GRACE_PERIOD_DATE_OVERDUE = new Date().getTime() - 1000;
var AMOUNT_OWED = 100;
var STRIPE_CUSTOMER_ID = {
    paymentMethodID: '1',
    intentsID: '2',
    currency: 'USD',
    status: 'authentication_required',
};
var BILLING_STATUS_INSUFFICIENT_FUNDS = {
    action: 'action',
    periodMonth: 'periodMonth',
    periodYear: 'periodYear',
    declineReason: 'insufficient_funds',
};
var BILLING_STATUS_EXPIRED_CARD = __assign(__assign({}, BILLING_STATUS_INSUFFICIENT_FUNDS), { declineReason: 'expired_card' });
var FUND_LIST = {
    defaultCard: {
        isDefault: true,
        accountData: {
            cardYear: new Date().getFullYear(),
            cardMonth: new Date().getMonth() + 1,
            additionalData: {
                isBillingCard: true,
            },
        },
    },
};
react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
describe('SubscriptionUtils', function () {
    describe('calculateRemainingFreeTrialDays', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = null,
                                _a))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 0 if the Onyx key is not set', function () {
            expect((0, SubscriptionUtils_1.calculateRemainingFreeTrialDays)()).toBe(0);
        });
        it('should return 0 if the current date is after the free trial end date', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL, (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 8), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING))];
                    case 1:
                        _a.sent();
                        expect((0, SubscriptionUtils_1.calculateRemainingFreeTrialDays)()).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 1 if the current date is on the same day of the free trial end date, but some minutes earlier', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL, (0, date_fns_1.format)((0, date_fns_1.addMinutes)(new Date(), 30), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING))];
                    case 1:
                        _a.sent();
                        expect((0, SubscriptionUtils_1.calculateRemainingFreeTrialDays)()).toBe(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return the remaining days if the current date is before the free trial end date', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL, (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 5), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING))];
                    case 1:
                        _a.sent();
                        expect((0, SubscriptionUtils_1.calculateRemainingFreeTrialDays)()).toBe(5);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('isUserOnFreeTrial', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = null,
                                _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = null,
                                _a))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if the Onyx keys are not set', function () {
            expect((0, SubscriptionUtils_1.isUserOnFreeTrial)()).toBeFalsy();
        });
        it('should return false if the current date is before the free trial start date', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 2), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 4), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.isUserOnFreeTrial)()).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if the current date is after the free trial end date', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 4), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 2), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.isUserOnFreeTrial)()).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true if the current date is on the same date of free trial start date', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 3), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.isUserOnFreeTrial)()).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true if the current date is on the same date of free trial end date, but some minutes earlier', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 2), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addMinutes)(new Date(), 30), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.isUserOnFreeTrial)()).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true if the current date is between the free trial start and end dates', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 1), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 3), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.isUserOnFreeTrial)()).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('hasUserFreeTrialEnded', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = null,
                                _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = null,
                                _a))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if the Onyx key is not set', function () {
            expect((0, SubscriptionUtils_1.hasUserFreeTrialEnded)()).toBeFalsy();
        });
        it('should return false if the current date is before the free trial end date', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL, (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 1), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING))];
                    case 1:
                        _a.sent();
                        expect((0, SubscriptionUtils_1.hasUserFreeTrialEnded)()).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true if the current date is after the free trial end date', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL, (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 2), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING))];
                    case 1:
                        _a.sent();
                        expect((0, SubscriptionUtils_1.hasUserFreeTrialEnded)()).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('doesUserHavePaymentCardAdded', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.NVP_BILLING_FUND_ID] = null,
                                _a))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if the Onyx key is not set', function () {
            expect((0, SubscriptionUtils_1.doesUserHavePaymentCardAdded)()).toBeFalsy();
        });
        it('should return true if the Onyx key is set', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_BILLING_FUND_ID, 8010)];
                    case 1:
                        _a.sent();
                        expect((0, SubscriptionUtils_1.doesUserHavePaymentCardAdded)()).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('shouldRestrictUserBillableActions', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.SESSION] = null,
                                _a[ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END] = null,
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = null,
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = null,
                                _a[ONYXKEYS_1.default.COLLECTION.POLICY] = null,
                                _a))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return false if the user isn't a workspace's owner or isn't a member of any past due billing workspace", function () {
            expect((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)('1')).toBeFalsy();
        });
        it('should return false if the user is a non-owner of a workspace that is not in the shared NVP collection', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, ownerAccountID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyID = '1001';
                        ownerAccountID = 2001;
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END).concat(ownerAccountID)] = __assign(__assign({}, billingGraceEndPeriod), { value: (0, date_fns_1.getUnixTime)((0, date_fns_1.subDays)(new Date(), 3)) }),
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: 2002 }),
                                _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyID)).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return false if the user is a workspace's non-owner that is not past due billing", function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, ownerAccountID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyID = '1001';
                        ownerAccountID = 2001;
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END).concat(ownerAccountID)] = __assign(__assign({}, billingGraceEndPeriod), { value: (0, date_fns_1.getUnixTime)((0, date_fns_1.addDays)(new Date(), 3)) }),
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: ownerAccountID }),
                                _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyID)).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return true if the user is a workspace's non-owner that is past due billing", function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, ownerAccountID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyID = '1001';
                        ownerAccountID = 2001;
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END).concat(ownerAccountID)] = __assign(__assign({}, billingGraceEndPeriod), { value: (0, date_fns_1.getUnixTime)((0, date_fns_1.subDays)(new Date(), 3)) }),
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: ownerAccountID }),
                                _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyID)).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return false if the user is the workspace's owner but is not past due billing", function () { return __awaiter(void 0, void 0, void 0, function () {
            var accountID, policyID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountID = 1;
                        policyID = '1001';
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.SESSION] = { email: '', accountID: accountID },
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = (0, date_fns_1.getUnixTime)((0, date_fns_1.addDays)(new Date(), 3)),
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: accountID }),
                                _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyID)).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return false if the user is the workspace's owner that is past due billing but isn't owning any amount", function () { return __awaiter(void 0, void 0, void 0, function () {
            var accountID, policyID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountID = 1;
                        policyID = '1001';
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.SESSION] = { email: '', accountID: accountID },
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = (0, date_fns_1.getUnixTime)((0, date_fns_1.subDays)(new Date(), 3)),
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = 0,
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: accountID }),
                                _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyID)).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return true if the user is the workspace's owner that is past due billing and is owning some amount", function () { return __awaiter(void 0, void 0, void 0, function () {
            var accountID, policyID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountID = 1;
                        policyID = '1001';
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.SESSION] = { email: '', accountID: accountID },
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = (0, date_fns_1.getUnixTime)((0, date_fns_1.subDays)(new Date(), 3)),
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = 8010,
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: accountID }),
                                _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyID)).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return false if the user is past due billing but is not the workspace's owner", function () { return __awaiter(void 0, void 0, void 0, function () {
            var accountID, policyID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountID = 1;
                        policyID = '1001';
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.SESSION] = { email: '', accountID: accountID },
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = (0, date_fns_1.getUnixTime)((0, date_fns_1.subDays)(new Date(), 3)),
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = 8010,
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: 2 }),
                                _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyID)).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getSubscriptionStatus', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = null,
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = null,
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_BILLING_DISPUTE_PENDING] = null,
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_STRIPE_CUSTOMER_ID] = null,
                                _a[ONYXKEYS_1.default.NVP_PRIVATE_BILLING_STATUS] = null,
                                _a[ONYXKEYS_1.default.FUND_LIST] = null,
                                _a[ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL] = null,
                                _a[ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED] = null,
                                _a))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return undefined by default', function () {
            expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toBeUndefined();
        });
        it('should return POLICY_OWNER_WITH_AMOUNT_OWED status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = GRACE_PERIOD_DATE,
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = AMOUNT_OWED,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = GRACE_PERIOD_DATE_OVERDUE,
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = AMOUNT_OWED,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = GRACE_PERIOD_DATE_OVERDUE,
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = 0,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return OWNER_OF_POLICY_UNDER_INVOICING status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = GRACE_PERIOD_DATE,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return BILLING_DISPUTE_PENDING status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = 0,
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_BILLING_DISPUTE_PENDING] = 1,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.BILLING_DISPUTE_PENDING,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return CARD_AUTHENTICATION_REQUIRED status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = 0,
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_BILLING_DISPUTE_PENDING] = 0,
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_STRIPE_CUSTOMER_ID] = STRIPE_CUSTOMER_ID,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return INSUFFICIENT_FUNDS status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = AMOUNT_OWED,
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_STRIPE_CUSTOMER_ID] = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_BILLING_STATUS] = BILLING_STATUS_INSUFFICIENT_FUNDS,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.INSUFFICIENT_FUNDS,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return CARD_EXPIRED status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_BILLING_STATUS] = BILLING_STATUS_EXPIRED_CARD,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.CARD_EXPIRED,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return CARD_EXPIRE_SOON status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED] = 0,
                            _a[ONYXKEYS_1.default.NVP_PRIVATE_BILLING_STATUS] = {},
                            _a[ONYXKEYS_1.default.FUND_LIST] = FUND_LIST,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.CARD_EXPIRE_SOON,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return RETRY_BILLING_SUCCESS status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.FUND_LIST] = {},
                            _a[ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL] = true,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.RETRY_BILLING_SUCCESS,
                            isError: false,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return RETRY_BILLING_ERROR status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.FUND_LIST] = {},
                            _a[ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL] = false,
                            _a[ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED] = true,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getSubscriptionStatus)()).toEqual({
                            status: SubscriptionUtils_1.PAYMENT_STATUS.RETRY_BILLING_ERROR,
                            isError: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('shouldShowDiscountBanner', function () {
        var ownerAccountID = 234;
        var policyID = '100012';
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if the user is not on a free trial', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.SESSION] = { accountID: ownerAccountID },
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: ownerAccountID, type: CONST_1.default.POLICY.TYPE.CORPORATE }),
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = null,
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = null,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldShowDiscountBanner)(true, 'corporate')).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return false if user has already added a payment method", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.SESSION] = { accountID: ownerAccountID },
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: ownerAccountID, type: CONST_1.default.POLICY.TYPE.TEAM }),
                            _a[ONYXKEYS_1.default.NVP_BILLING_FUND_ID] = 8010,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldShowDiscountBanner)(true, 'corporate')).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if the user is on Team plan', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.SESSION] = { accountID: ownerAccountID },
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: ownerAccountID, type: CONST_1.default.POLICY.TYPE.CORPORATE }),
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 1), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 10), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldShowDiscountBanner)(true, 'team')).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true if the date is before the free trial end date or within the 8 days from the trial start date', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.SESSION] = { accountID: ownerAccountID },
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { ownerAccountID: ownerAccountID, type: CONST_1.default.POLICY.TYPE.CORPORATE }),
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 1), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 10), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldShowDiscountBanner)(true, 'corporate')).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return false if user's trial is during the discount period but has no workspaces", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.SESSION] = { accountID: ownerAccountID },
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 1), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 10), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.shouldShowDiscountBanner)(true, 'corporate')).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getEarlyDiscountInfo', function () {
        var TEST_DATE = new Date();
        beforeEach(function () {
            jest.spyOn(Date, 'now').mockImplementation(function () { return TEST_DATE.getTime(); });
        });
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(Date, 'now').mockRestore();
                        return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return the discount info if the user is on a free trial and trial was started less than 24 hours before', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addMinutes)((0, date_fns_1.subDays)(new Date(TEST_DATE), 1), 12), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(TEST_DATE), 10), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getEarlyDiscountInfo)()).toEqual({
                            discountType: 50,
                            days: 0,
                            hours: 0,
                            minutes: 12,
                            seconds: 0,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return the discount info if the user is on a free trial and trial was started more than 24 hours before', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(TEST_DATE), 2), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(TEST_DATE), 10), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getEarlyDiscountInfo)()).toEqual({
                            discountType: 25,
                            days: 6,
                            hours: 0,
                            minutes: 0,
                            seconds: 0,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return null if the user is not on a free trial', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL] = null,
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = null,
                            _a))];
                    case 1:
                        _b.sent();
                        expect((0, SubscriptionUtils_1.getEarlyDiscountInfo)()).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
