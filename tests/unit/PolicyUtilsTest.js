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
/* eslint-disable @typescript-eslint/naming-convention */
var react_native_onyx_1 = require("react-native-onyx");
var DateUtils_1 = require("@libs/DateUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var createCollection_1 = require("../utils/collections/createCollection");
var policies_1 = require("../utils/collections/policies");
var reports_1 = require("../utils/collections/reports");
var transaction_1 = require("../utils/collections/transaction");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
var CARLOS_EMAIL = 'cmartins@expensifail.com';
var CARLOS_ACCOUNT_ID = 1;
function toLocaleDigitMock(dot) {
    return dot;
}
var GENERATED_ACCOUNT_ID = '555555';
jest.mock('@libs/UserUtils', function () { return ({
    // generateAccountID: () => GENERATED_ACCOUNT_ID,
    generateAccountID: jest.fn().mockReturnValue(GENERATED_ACCOUNT_ID),
}); });
var testDate = DateUtils_1.default.getDBTime();
var employeeList = {
    'owner@test.com': {
        email: 'owner@test.com',
        role: 'admin',
        submitsTo: '',
    },
    'admin@test.com': {
        email: 'admin@test.com',
        role: 'admin',
        submitsTo: '',
    },
    'employee@test.com': {
        email: 'employee@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'categoryapprover1@test.com': {
        email: 'categoryapprover1@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'categoryapprover2@test.com': {
        email: 'categoryapprover2@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'tagapprover1@test.com': {
        email: 'tagapprover1@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'tagapprover2@test.com': {
        email: 'tagapprover2@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
};
var adminAccountID = 1;
var employeeAccountID = 2;
var categoryApprover1AccountID = 3;
var categoryApprover2AccountID = 4;
var tagApprover1AccountID = 5;
var tagApprover2AccountID = 6;
var ownerAccountID = 7;
var approverAccountID = 8;
var employeeEmail = 'employee@test.com';
var adminEmail = 'admin@test.com';
var categoryApprover1Email = 'categoryapprover1@test.com';
var approverEmail = 'approver@test.com';
var personalDetails = {
    '1': {
        accountID: adminAccountID,
        login: adminEmail,
    },
    '2': {
        accountID: employeeAccountID,
        login: employeeEmail,
    },
    '3': {
        accountID: categoryApprover1AccountID,
        login: categoryApprover1Email,
    },
    '4': {
        accountID: categoryApprover2AccountID,
        login: 'categoryapprover2@test.com',
    },
    '5': {
        accountID: tagApprover1AccountID,
        login: 'tagapprover1@test.com',
    },
    '6': {
        accountID: tagApprover2AccountID,
        login: 'tagapprover2@test.com',
    },
    '7': {
        accountID: ownerAccountID,
        login: 'owner@test.com',
    },
    '8': {
        accountID: approverAccountID,
        login: approverEmail,
    },
};
var rules = {
    approvalRules: [
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat1',
                },
            ],
            approver: 'categoryapprover1@test.com',
            id: '1',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'tag',
                    value: 'tag1',
                },
            ],
            approver: 'tagapprover1@test.com',
            id: '2',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat2',
                },
            ],
            approver: 'categoryapprover2@test.com',
            id: '3',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'tag',
                    value: 'tag2',
                },
            ],
            approver: 'tagapprover2@test.com',
            id: '4',
        },
    ],
};
describe('PolicyUtils', function () {
    describe('getActivePolicies', function () {
        it("getActivePolicies should filter out policies that the current user doesn't belong to", function () {
            var policies = (0, createCollection_1.default)(function (item) { return "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(item.id); }, function (index) { return (__assign(__assign(__assign({}, (0, policies_1.default)(index + 1)), { name: 'workspace', pendingAction: null }), (!index && { role: null }))); }, 2);
            expect((0, PolicyUtils_1.getActivePolicies)(policies, undefined)).toHaveLength(1);
        });
    });
    describe('getRateDisplayValue', function () {
        it('should return an empty string for NaN', function () {
            var rate = (0, PolicyUtils_1.getRateDisplayValue)('invalid', toLocaleDigitMock);
            expect(rate).toEqual('');
        });
        describe('withDecimals = false', function () {
            it('should return integer value as is', function () {
                var rate = (0, PolicyUtils_1.getRateDisplayValue)(100, toLocaleDigitMock);
                expect(rate).toEqual('100');
            });
            it('should return non-integer value as is', function () {
                var rate = (0, PolicyUtils_1.getRateDisplayValue)(10.5, toLocaleDigitMock);
                expect(rate).toEqual('10.5');
            });
        });
        describe('withDecimals = true', function () {
            it('should return integer value with 2 trailing zeros', function () {
                var rate = (0, PolicyUtils_1.getRateDisplayValue)(10, toLocaleDigitMock, true);
                expect(rate).toEqual('10.00');
            });
            it('should return non-integer value with up to 2 trailing zeros', function () {
                var rate = (0, PolicyUtils_1.getRateDisplayValue)(10.5, toLocaleDigitMock, true);
                expect(rate).toEqual('10.50');
            });
            it('should return non-integer value with 4 decimals as is', function () {
                var rate = (0, PolicyUtils_1.getRateDisplayValue)(10.5312, toLocaleDigitMock, true);
                expect(rate).toEqual('10.5312');
            });
            it('should return non-integer value with 3 decimals as is', function () {
                var rate = (0, PolicyUtils_1.getRateDisplayValue)(10.531, toLocaleDigitMock, true);
                expect(rate).toEqual('10.531');
            });
            it('should return non-integer value with 4+ decimals cut to 4', function () {
                var rate = (0, PolicyUtils_1.getRateDisplayValue)(10.53135, toLocaleDigitMock, true);
                expect(rate).toEqual('10.5313');
            });
        });
    });
    describe('getUnitRateValue', function () {
        it('should return an empty string for NaN', function () {
            var rate = (0, PolicyUtils_1.getUnitRateValue)(toLocaleDigitMock, { rate: 'invalid' });
            expect(rate).toEqual('');
        });
        describe('withDecimals = false', function () {
            it('should return value divisible by 100 with no decimal places', function () {
                var rate = (0, PolicyUtils_1.getUnitRateValue)(toLocaleDigitMock, { rate: 100 });
                expect(rate).toEqual('1');
            });
            it('should return non-integer value as is divided by 100', function () {
                var rate = (0, PolicyUtils_1.getUnitRateValue)(toLocaleDigitMock, { rate: 11.11 });
                expect(rate).toEqual('0.1111');
            });
        });
        describe('withDecimals = true', function () {
            it('should return value divisible by 100 with 2 decimal places', function () {
                var rate = (0, PolicyUtils_1.getUnitRateValue)(toLocaleDigitMock, { rate: 100 }, true);
                expect(rate).toEqual('1.00');
            });
            it('should return non-integer value as is divided by 100', function () {
                var rate = (0, PolicyUtils_1.getUnitRateValue)(toLocaleDigitMock, { rate: 11.11 }, true);
                expect(rate).toEqual('0.1111');
            });
        });
    });
    describe('getSubmitToAccountID', function () {
        beforeEach(function () {
            (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
            react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        describe('Has no rule approver', function () {
            it('should return the policy approver/owner if the policy use the basic workflow', function () {
                var policy = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.TEAM, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC });
                var expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                expect((0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)).toBe(ownerAccountID);
            });
            it('should return the policy approver/owner if the policy use the optional workflow', function () {
                var policy = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.TEAM, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL });
                var expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                expect((0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)).toBe(ownerAccountID);
            });
            it('should return the employee submitsTo if the policy use the advance workflow', function () {
                var policy = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', employeeList: employeeList, type: CONST_1.default.POLICY.TYPE.CORPORATE, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED });
                var expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                expect((0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)).toBe(adminAccountID);
            });
        });
        describe('Has category/tag approver', function () {
            it('should return the first category approver if has any transaction category match with category approver rule', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policy, expenseReport, transaction1, transaction2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            policy = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.CORPORATE, employeeList: employeeList, rules: rules, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED });
                            expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                            transaction1 = __assign(__assign({}, (0, transaction_1.default)(0)), { category: 'cat1', reportID: expenseReport.reportID });
                            transaction2 = __assign(__assign({}, (0, transaction_1.default)(1)), { category: '', reportID: expenseReport.reportID });
                            return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.TRANSACTION, (_a = {},
                                    _a[transaction1.transactionID] = transaction1,
                                    _a[transaction2.transactionID] = transaction2,
                                    _a))];
                        case 1:
                            _b.sent();
                            expect((0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)).toBe(categoryApprover1AccountID);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return default approver if rule approver is submitter and prevent self approval is enabled', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policy, expenseReport, transaction;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            policy = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.CORPORATE, employeeList: employeeList, rules: rules, preventSelfApproval: true, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED });
                            expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: categoryApprover1AccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                            transaction = __assign(__assign({}, (0, transaction_1.default)(0)), { category: 'cat1', reportID: expenseReport.reportID, tag: '' });
                            return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.TRANSACTION, (_a = {},
                                    _a[transaction.transactionID] = transaction,
                                    _a))];
                        case 1:
                            _b.sent();
                            expect((0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)).toBe(adminAccountID);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return the category approver of the first transaction sorted by created if we have many transaction categories match with the category approver rule', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policy, expenseReport, transaction1, transaction2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            policy = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.CORPORATE, employeeList: employeeList, rules: rules, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED });
                            expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                            transaction1 = __assign(__assign({}, (0, transaction_1.default)(0)), { category: 'cat1', created: testDate, reportID: expenseReport.reportID });
                            transaction2 = __assign(__assign({}, (0, transaction_1.default)(1)), { category: 'cat2', created: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 1), reportID: expenseReport.reportID });
                            return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.TRANSACTION, (_a = {},
                                    _a[transaction1.transactionID] = transaction1,
                                    _a[transaction2.transactionID] = transaction2,
                                    _a))];
                        case 1:
                            _b.sent();
                            expect((0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)).toBe(categoryApprover2AccountID);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('Has no transaction match with the category approver rule', function () {
                it('should return the first tag approver if has any transaction tag match with with the tag approver rule ', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var policy, expenseReport, transaction1, transaction2;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                policy = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.CORPORATE, employeeList: employeeList, rules: rules, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED });
                                expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                                transaction1 = __assign(__assign({}, (0, transaction_1.default)(0)), { category: '', tag: 'tag1', created: testDate, reportID: expenseReport.reportID });
                                transaction2 = __assign(__assign({}, (0, transaction_1.default)(1)), { category: '', tag: '', created: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 1), reportID: expenseReport.reportID });
                                return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.TRANSACTION, (_a = {},
                                        _a[transaction1.transactionID] = transaction1,
                                        _a[transaction2.transactionID] = transaction2,
                                        _a))];
                            case 1:
                                _b.sent();
                                expect((0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)).toBe(tagApprover1AccountID);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should return the tag approver of the first transaction sorted by created if we have many transaction tags match with the tag approver rule', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var policy, expenseReport, transaction1, transaction2;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                policy = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.CORPORATE, employeeList: employeeList, rules: rules, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED });
                                expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                                transaction1 = __assign(__assign({}, (0, transaction_1.default)(0)), { category: '', tag: 'tag1', created: testDate, reportID: expenseReport.reportID });
                                transaction2 = __assign(__assign({}, (0, transaction_1.default)(1)), { category: '', tag: 'tag2', created: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 1), reportID: expenseReport.reportID });
                                return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.TRANSACTION, (_a = {},
                                        _a[transaction1.transactionID] = transaction1,
                                        _a[transaction2.transactionID] = transaction2,
                                        _a))];
                            case 1:
                                _b.sent();
                                expect((0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)).toBe(tagApprover2AccountID);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
    });
    describe('shouldShowPolicy', function () {
        beforeAll(function () {
            var _a;
            react_native_onyx_1.default.init({
                keys: ONYXKEYS_1.default,
                initialKeyStates: (_a = {},
                    _a[ONYXKEYS_1.default.SESSION] = { accountID: CARLOS_ACCOUNT_ID, email: CARLOS_EMAIL },
                    _a),
            });
        });
        beforeEach(function () {
            global.fetch = TestHelper.getGlobalFetchMock();
            return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
        });
        it('should return false', function () {
            // Given an archived paid policy.
            var policy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.CORPORATE)), { role: '' });
            var result = (0, PolicyUtils_1.shouldShowPolicy)(policy, false, CARLOS_EMAIL);
            // The result should be false since it is an archived paid policy.
            expect(result).toBe(false);
        });
        it('should return true', function () {
            // Given a paid policy.
            var policy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.CORPORATE)), { pendingAction: null });
            var result = (0, PolicyUtils_1.shouldShowPolicy)(policy, false, CARLOS_EMAIL);
            // The result should be true, since it is an active paid policy.
            expect(result).toBe(true);
        });
        it('should return false', function () {
            // Given a control workspace which is pending delete.
            var policy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.CORPORATE)), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE });
            var result = (0, PolicyUtils_1.shouldShowPolicy)(policy, false, CARLOS_EMAIL);
            // The result should be false since it is a policy which is pending deletion.
            expect(result).toEqual(false);
        });
    });
    describe('getPolicyNameByID', function () {
        it('should return the policy name for a given policyID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.TEAM)), { name: 'testName' });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1"), policy)];
                    case 1:
                        _a.sent();
                        expect((0, PolicyUtils_1.getPolicyNameByID)('1')).toBe('testName');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return the empty if the name is not set', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.TEAM)), { 
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            name: null });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1"), policy)];
                    case 1:
                        _a.sent();
                        expect((0, PolicyUtils_1.getPolicyNameByID)('1')).toBe('');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getManagerAccountID', function () {
        beforeEach(function () {
            (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
            react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return default approver for personal workspaces', function () {
            var policy = __assign(__assign({}, (0, policies_1.default)(0)), { type: CONST_1.default.POLICY.TYPE.PERSONAL, approver: categoryApprover1Email });
            var report = __assign({}, (0, reports_1.createRandomReport)(0));
            var result = (0, PolicyUtils_1.getManagerAccountID)(policy, report);
            expect(result).toBe(categoryApprover1AccountID);
        });
        it('should return -1 if there is no employee or default approver', function () {
            var policy = __assign(__assign({}, (0, policies_1.default)(0)), { type: CONST_1.default.POLICY.TYPE.TEAM, approvalMode: undefined, approver: undefined, owner: '' });
            var report = __assign({}, (0, reports_1.createRandomReport)(0));
            var result = (0, PolicyUtils_1.getManagerAccountID)(policy, report);
            expect(result).toBe(-1);
        });
        it('should return submitsTo account ID', function () {
            var _a;
            var policy = __assign(__assign({}, (0, policies_1.default)(0)), { type: CONST_1.default.POLICY.TYPE.TEAM, approvalMode: undefined, employeeList: (_a = {},
                    _a[employeeEmail] = {
                        email: employeeEmail,
                        submitsTo: adminEmail,
                    },
                    _a) });
            var report = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID });
            var result = (0, PolicyUtils_1.getManagerAccountID)(policy, report);
            expect(result).toBe(adminAccountID);
        });
        it('should return the default approver', function () {
            var policy = __assign(__assign({}, (0, policies_1.default)(0)), { type: CONST_1.default.POLICY.TYPE.TEAM, approvalMode: undefined, approver: categoryApprover1Email });
            var report = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { ownerAccountID: employeeAccountID });
            var result = (0, PolicyUtils_1.getManagerAccountID)(policy, report);
            expect(result).toBe(categoryApprover1AccountID);
        });
    });
    describe('isWorkspaceEligibleForReportChange', function () {
        beforeEach(function () {
            (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
            react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns false if policy is not paid group policy', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentUserLogin, currentUserAccountID, newPolicy, policies, report, result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentUserLogin = employeeEmail;
                        currentUserAccountID = employeeAccountID;
                        newPolicy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.PERSONAL)), { isPolicyExpenseChatEnabled: true, employeeList: (_a = {},
                                _a[currentUserLogin] = { email: currentUserLogin, role: CONST_1.default.POLICY.ROLE.USER },
                                _a) });
                        policies = (_b = {}, _b["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(newPolicy.id)] = newPolicy, _b);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(newPolicy.id), newPolicy)];
                    case 1:
                        _c.sent();
                        report = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { type: CONST_1.default.REPORT.TYPE.IOU, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, ownerAccountID: currentUserAccountID, managerID: approverAccountID });
                        result = (0, ReportUtils_1.isWorkspaceEligibleForReportChange)(newPolicy, report, policies);
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns true if policy is paid group policy and the manger is the payer', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentUserLogin, currentUserAccountID, newPolicy, policies, report, result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentUserLogin = employeeEmail;
                        currentUserAccountID = employeeAccountID;
                        newPolicy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.TEAM)), { reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL, isPolicyExpenseChatEnabled: true, employeeList: (_a = {},
                                _a[currentUserLogin] = { email: currentUserLogin, role: CONST_1.default.POLICY.ROLE.ADMIN },
                                _a) });
                        policies = (_b = {}, _b["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(newPolicy.id)] = newPolicy, _b);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(newPolicy.id), newPolicy)];
                    case 1:
                        _c.sent();
                        report = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { type: CONST_1.default.REPORT.TYPE.IOU, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, ownerAccountID: approverAccountID, managerID: currentUserAccountID });
                        result = (0, ReportUtils_1.isWorkspaceEligibleForReportChange)(newPolicy, report, policies);
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns false if the manager is not the payer of the new policy', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newPolicy, policies, report, result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        newPolicy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.TEAM)), { isPolicyExpenseChatEnabled: true, role: CONST_1.default.POLICY.ROLE.ADMIN, employeeList: (_a = {},
                                _a[approverEmail] = { email: approverEmail, role: CONST_1.default.POLICY.ROLE.USER },
                                _a) });
                        policies = (_b = {}, _b["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(newPolicy.id)] = newPolicy, _b);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(newPolicy.id), newPolicy)];
                    case 1:
                        _c.sent();
                        report = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { type: CONST_1.default.REPORT.TYPE.IOU, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, ownerAccountID: employeeAccountID, managerID: approverAccountID });
                        result = (0, ReportUtils_1.isWorkspaceEligibleForReportChange)(newPolicy, report, policies);
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns false if policies are not policyExpenseChatEnabled', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentUserLogin, currentUserAccountID, newPolicy, policies, report, result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentUserLogin = employeeEmail;
                        currentUserAccountID = employeeAccountID;
                        newPolicy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.TEAM)), { reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL, isPolicyExpenseChatEnabled: false, employeeList: (_a = {},
                                _a[currentUserLogin] = { email: currentUserLogin, role: CONST_1.default.POLICY.ROLE.ADMIN },
                                _a) });
                        policies = (_b = {}, _b["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(newPolicy.id)] = newPolicy, _b);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(newPolicy.id), newPolicy)];
                    case 1:
                        _c.sent();
                        report = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { type: CONST_1.default.REPORT.TYPE.IOU, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, ownerAccountID: approverAccountID, managerID: currentUserAccountID });
                        result = (0, ReportUtils_1.isWorkspaceEligibleForReportChange)(newPolicy, report, policies);
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('isUserInvitedToWorkspace', function () {
        beforeEach(function () {
            (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        });
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if user has no policies', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentUserLogin, currentUserAccountID, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUserLogin = approverEmail;
                        currentUserAccountID = approverAccountID;
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserLogin, accountID: currentUserAccountID })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, {})];
                    case 2:
                        _a.sent();
                        result = (0, PolicyUtils_1.isUserInvitedToWorkspace)();
                        expect(result).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if user owns a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentUserLogin, currentUserAccountID, policies, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUserLogin = approverEmail;
                        currentUserAccountID = approverAccountID;
                        policies = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL, "John's Workspace")), { ownerAccountID: approverAccountID });
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserLogin, accountID: currentUserAccountID })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, policies)];
                    case 2:
                        _a.sent();
                        result = (0, PolicyUtils_1.isUserInvitedToWorkspace)();
                        expect(result).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if expense chat is not enabled', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentUserLogin, currentUserAccountID, policies, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUserLogin = approverEmail;
                        currentUserAccountID = approverAccountID;
                        policies = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL, "John's Workspace")), { isPolicyExpenseChatEnabled: false });
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserLogin, accountID: currentUserAccountID })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, policies)];
                    case 2:
                        _a.sent();
                        result = (0, PolicyUtils_1.isUserInvitedToWorkspace)();
                        expect(result).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if its a fake policy id', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentUserLogin, currentUserAccountID, policies, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUserLogin = approverEmail;
                        currentUserAccountID = approverAccountID;
                        policies = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL, "John's Workspace")), { id: CONST_1.default.POLICY.ID_FAKE });
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserLogin, accountID: currentUserAccountID })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, policies)];
                    case 2:
                        _a.sent();
                        result = (0, PolicyUtils_1.isUserInvitedToWorkspace)();
                        expect(result).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true if user is invited to a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentUserLogin, currentUserAccountID, policies, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUserLogin = approverEmail;
                        currentUserAccountID = approverAccountID;
                        policies = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL, "John's Workspace")), { ownerAccountID: ownerAccountID, isPolicyExpenseChatEnabled: true });
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserLogin, accountID: currentUserAccountID })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, policies)];
                    case 2:
                        _a.sent();
                        result = (0, PolicyUtils_1.isUserInvitedToWorkspace)();
                        expect(result).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
