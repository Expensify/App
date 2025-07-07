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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var react_native_onyx_1 = require("react-native-onyx");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Localize_1 = require("@libs/Localize");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var ViolationsUtils_1 = require("@libs/Violations/ViolationsUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var categoryOutOfPolicyViolation = {
    name: CONST_1.default.VIOLATIONS.CATEGORY_OUT_OF_POLICY,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
};
var missingCategoryViolation = {
    name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};
var futureDateViolation = {
    name: CONST_1.default.VIOLATIONS.FUTURE_DATE,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};
var receiptRequiredViolation = {
    name: CONST_1.default.VIOLATIONS.RECEIPT_REQUIRED,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: {
        formattedLimit: (0, CurrencyUtils_1.convertAmountToDisplayString)(CONST_1.default.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT),
    },
};
var categoryReceiptRequiredViolation = {
    name: CONST_1.default.VIOLATIONS.RECEIPT_REQUIRED,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: undefined,
};
var overLimitViolation = {
    name: CONST_1.default.VIOLATIONS.OVER_LIMIT,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: {
        formattedLimit: (0, CurrencyUtils_1.convertAmountToDisplayString)(CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT),
    },
};
var categoryOverLimitViolation = {
    name: CONST_1.default.VIOLATIONS.OVER_CATEGORY_LIMIT,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: {
        formattedLimit: (0, CurrencyUtils_1.convertAmountToDisplayString)(CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT),
    },
};
var categoryMissingCommentViolation = {
    name: CONST_1.default.VIOLATIONS.MISSING_COMMENT,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};
var customUnitOutOfPolicyViolation = {
    name: CONST_1.default.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
};
var missingTagViolation = {
    name: CONST_1.default.VIOLATIONS.MISSING_TAG,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
};
var tagOutOfPolicyViolation = {
    name: CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
};
var smartScanFailedViolation = {
    name: CONST_1.default.VIOLATIONS.SMARTSCAN_FAILED,
    type: CONST_1.default.VIOLATION_TYPES.WARNING,
};
var duplicatedTransactionViolation = {
    name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
    type: CONST_1.default.VIOLATION_TYPES.WARNING,
};
describe('getViolationsOnyxData', function () {
    var transaction;
    var transactionViolations;
    var policy;
    var policyTags;
    var policyCategories;
    (0, globals_1.beforeEach)(function () {
        transaction = {
            transactionID: '123',
            reportID: '1234',
            amount: 100,
            comment: { attendees: [{ email: 'text@expensify.com', displayName: 'Test User', avatarUrl: '' }] },
            created: '2023-07-24 13:46:20',
            merchant: 'United Airlines',
            currency: CONST_1.default.CURRENCY.USD,
        };
        transactionViolations = [];
        policy = { requiresTag: false, requiresCategory: false };
        policyTags = {};
        policyCategories = {};
    });
    it('should return an object with correct shape and with empty transactionViolations array', function () {
        var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
        expect(result).toEqual({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID),
            value: transactionViolations,
        });
    });
    it('should handle multiple violations', function () {
        policy.type = 'corporate';
        policy.maxExpenseAmountNoReceipt = 25;
        transaction.amount = 100;
        transactionViolations = [
            { name: 'duplicatedTransaction', type: CONST_1.default.VIOLATION_TYPES.VIOLATION },
            { name: 'receiptRequired', type: CONST_1.default.VIOLATION_TYPES.VIOLATION },
        ];
        var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
        expect(result.value).toEqual(expect.arrayContaining(transactionViolations));
    });
    describe('distance rate was modified', function () {
        (0, globals_1.beforeEach)(function () {
            var _a;
            var _b, _c;
            transactionViolations = [customUnitOutOfPolicyViolation];
            var customUnitRateID = 'rate_id';
            transaction.comment = __assign(__assign({}, transaction.comment), { customUnit: __assign(__assign({}, ((_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.customUnit) !== null && _c !== void 0 ? _c : {})), { customUnitRateID: customUnitRateID }) });
            policy.customUnits = {
                unitId: {
                    attributes: { unit: 'mi' },
                    customUnitID: 'unitId',
                    defaultCategory: 'Car',
                    enabled: true,
                    name: 'Distance',
                    rates: (_a = {},
                        _a[customUnitRateID] = {
                            currency: 'USD',
                            customUnitRateID: customUnitRateID,
                            enabled: true,
                            name: 'Default Rate',
                            rate: 65.5,
                        },
                        _a),
                },
            };
        });
        it('should remove the customUnitOutOfPolicy violation if the modified one belongs to the policy', function () {
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(customUnitOutOfPolicyViolation);
        });
    });
    describe('controlPolicyViolations', function () {
        (0, globals_1.beforeEach)(function () {
            policy.type = 'corporate';
            policy.outputCurrency = CONST_1.default.CURRENCY.USD;
        });
        it('should not add futureDate violation if the policy is not corporate', function () {
            transaction.created = '9999-12-31T23:59:59Z';
            policy.type = 'personal';
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(transactionViolations);
        });
        it('should add futureDate violation if the transaction has a future date and policy is corporate', function () {
            transaction.created = '9999-12-31T23:59:59Z';
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([futureDateViolation], transactionViolations, true)));
        });
        it('should remove futureDate violation if the policy is downgraded', function () {
            transaction.created = '9999-12-31T23:59:59Z';
            policy.type = 'personal';
            transactionViolations = [futureDateViolation];
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(futureDateViolation);
        });
        it('should add receiptRequired violation if the transaction has no receipt', function () {
            transaction.amount = 1000000;
            policy.maxExpenseAmountNoReceipt = 2500;
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([receiptRequiredViolation], transactionViolations, true)));
        });
        it('should not add receiptRequired violation if the transaction has different currency than the workspace currency', function () {
            transaction.amount = 1000000;
            transaction.modifiedCurrency = CONST_1.default.CURRENCY.CAD;
            policy.maxExpenseAmountNoReceipt = 2500;
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([]);
        });
        it('should add overLimit violation if the transaction amount is over the policy limit', function () {
            transaction.amount = 1000000;
            policy.maxExpenseAmount = 200000;
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([overLimitViolation], transactionViolations, true)));
        });
        it('should not add overLimit violation if the transaction currency is different from the workspace currency', function () {
            transaction.amount = 1000000;
            transaction.modifiedCurrency = CONST_1.default.CURRENCY.NZD;
            policy.maxExpenseAmount = 200000;
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([]);
        });
    });
    describe('policyCategoryRules', function () {
        (0, globals_1.beforeEach)(function () {
            policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
            policy.outputCurrency = CONST_1.default.CURRENCY.USD;
            policyCategories = {
                Food: {
                    name: 'Food',
                    enabled: true,
                    areCommentsRequired: true,
                    maxAmountNoReceipt: 0,
                    maxExpenseAmount: CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT,
                },
            };
            transaction.category = 'Food';
            transaction.amount = CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT + 1;
            transaction.comment = { comment: '' };
        });
        it('should add category specific violations', function () {
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([categoryOverLimitViolation, categoryReceiptRequiredViolation, categoryMissingCommentViolation], transactionViolations, true)));
        });
    });
    describe('policyRequiresCategories', function () {
        (0, globals_1.beforeEach)(function () {
            policy.requiresCategory = true;
            policyCategories = { Food: { name: 'Food', unencodedName: '', enabled: true, areCommentsRequired: false, externalID: '1234', origin: '12345' } };
            transaction.category = 'Food';
            transaction.amount = 100;
        });
        it('should add missingCategory violation if no category is included', function () {
            transaction.category = undefined;
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([missingCategoryViolation], transactionViolations, true)));
        });
        it('should add categoryOutOfPolicy violation when category is not in policy', function () {
            transaction.category = 'Bananas';
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([categoryOutOfPolicyViolation], transactionViolations, true)));
        });
        it('should not include a categoryOutOfPolicy violation when category is in policy', function () {
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
        });
        it('should not add a category violation when the transaction is partial', function () {
            var partialTransaction = __assign(__assign({}, transaction), { amount: 0, merchant: CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, category: undefined });
            var result = ViolationsUtils_1.default.getViolationsOnyxData(partialTransaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(missingCategoryViolation);
        });
        it('should add categoryOutOfPolicy violation to existing violations if they exist', function () {
            transaction.category = 'Bananas';
            transaction.amount = 1000000;
            transactionViolations = [{ name: 'duplicatedTransaction', type: CONST_1.default.VIOLATION_TYPES.VIOLATION }];
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([categoryOutOfPolicyViolation], transactionViolations, true)));
        });
        it('should add missingCategory violation to existing violations if they exist', function () {
            transaction.category = undefined;
            transaction.amount = 1000000;
            transactionViolations = [{ name: 'duplicatedTransaction', type: CONST_1.default.VIOLATION_TYPES.VIOLATION }];
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([missingCategoryViolation], transactionViolations, true)));
        });
    });
    describe('policy does not require Categories', function () {
        (0, globals_1.beforeEach)(function () {
            policy.requiresCategory = false;
        });
        it('should not add any violations when categories are not required', function () {
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
            expect(result.value).not.toContainEqual(missingCategoryViolation);
        });
    });
    describe('policyRequiresTags', function () {
        (0, globals_1.beforeEach)(function () {
            policy.requiresTag = true;
            policyTags = {
                Meals: {
                    name: 'Meals',
                    required: true,
                    tags: {
                        Lunch: { name: 'Lunch', enabled: true },
                        Dinner: { name: 'Dinner', enabled: true },
                    },
                    orderWeight: 1,
                },
            };
            transaction.tag = 'Lunch';
        });
        it("shouldn't update the transactionViolations if the policy requires tags and the transaction has a tag from the policy", function () {
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(transactionViolations);
        });
        it('should add a missingTag violation if none is provided and policy requires tags', function () {
            transaction.tag = undefined;
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining([__assign({}, missingTagViolation)]));
        });
        it('should add a tagOutOfPolicy violation when policy requires tags and tag is not in the policy', function () {
            policyTags = {};
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([]);
        });
        it('should not add a tag violation when the transaction is partial', function () {
            var partialTransaction = __assign(__assign({}, transaction), { amount: 0, merchant: CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, tag: undefined });
            var result = ViolationsUtils_1.default.getViolationsOnyxData(partialTransaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(missingTagViolation);
        });
        it('should add tagOutOfPolicy violation to existing violations if transaction has tag that is not in the policy', function () {
            transaction.tag = 'Bananas';
            transactionViolations = [{ name: 'duplicatedTransaction', type: CONST_1.default.VIOLATION_TYPES.VIOLATION }];
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([__assign({}, tagOutOfPolicyViolation)], transactionViolations, true)));
        });
        it('should add missingTag violation to existing violations if transaction does not have a tag', function () {
            transaction.tag = undefined;
            transactionViolations = [{ name: 'duplicatedTransaction', type: CONST_1.default.VIOLATION_TYPES.VIOLATION }];
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining(__spreadArray([__assign({}, missingTagViolation)], transactionViolations, true)));
        });
    });
    describe('policy does not require Tags', function () {
        (0, globals_1.beforeEach)(function () {
            policy.requiresTag = false;
        });
        it('should not add any violations when tags are not required', function () {
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(tagOutOfPolicyViolation);
            expect(result.value).not.toContainEqual(missingTagViolation);
        });
    });
    describe('policy has multi level tags', function () {
        (0, globals_1.beforeEach)(function () {
            policy.requiresTag = true;
            policyTags = {
                Department: {
                    name: 'Department',
                    tags: {
                        Accounting: {
                            name: 'Accounting',
                            enabled: true,
                        },
                    },
                    required: true,
                    orderWeight: 2,
                },
                Region: {
                    name: 'Region',
                    tags: {
                        Africa: {
                            name: 'Africa',
                            enabled: true,
                        },
                    },
                    required: true,
                    orderWeight: 1,
                },
                Project: {
                    name: 'Project',
                    tags: {
                        Project1: {
                            name: 'Project1',
                            enabled: true,
                        },
                    },
                    required: true,
                    orderWeight: 3,
                },
            };
        });
        it('should return someTagLevelsRequired when a required tag is missing', function () {
            var someTagLevelsRequiredViolation = {
                name: 'someTagLevelsRequired',
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                data: {
                    errorIndexes: [0, 1, 2],
                },
            };
            // Test case where transaction has no tags
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);
            // Test case where transaction has 1 tag
            transaction.tag = 'Africa';
            someTagLevelsRequiredViolation.data = { errorIndexes: [1, 2] };
            result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);
            // Test case where transaction has 2 tags
            transaction.tag = 'Africa::Project1';
            someTagLevelsRequiredViolation.data = { errorIndexes: [1] };
            result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);
            // Test case where transaction has all tags
            transaction.tag = 'Africa:Accounting:Project1';
            result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([]);
        });
        it('should return tagOutOfPolicy when a tag is not enabled in the policy but is set in the transaction', function () {
            policyTags.Department.tags.Accounting.enabled = false;
            transaction.tag = 'Africa:Accounting:Project1';
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            var violation = __assign(__assign({}, tagOutOfPolicyViolation), { data: { tagName: 'Department' } });
            expect(result.value).toEqual([violation]);
        });
        it('should return missingTag when all dependent tags are enabled in the policy but are not set in the transaction', function () {
            var missingDepartmentTag = __assign(__assign({}, missingTagViolation), { data: { tagName: 'Department' } });
            var missingRegionTag = __assign(__assign({}, missingTagViolation), { data: { tagName: 'Region' } });
            var missingProjectTag = __assign(__assign({}, missingTagViolation), { data: { tagName: 'Project' } });
            transaction.tag = undefined;
            var result = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, true, false);
            expect(result.value).toEqual(expect.arrayContaining([missingDepartmentTag, missingRegionTag, missingProjectTag]));
        });
    });
});
var getFakeTransaction = function (transactionID, comment) { return ({
    transactionID: transactionID,
    attendees: [{ email: 'text@expensify.com' }],
    reportID: '1234',
    amount: 100,
    comment: comment !== null && comment !== void 0 ? comment : {},
    created: '2023-07-24 13:46:20',
    merchant: 'United Airlines',
    currency: 'USD',
}); };
var CARLOS_EMAIL = 'cmartins@expensifail.com';
var CARLOS_ACCOUNT_ID = 1;
describe('getViolations', function () {
    beforeAll(function () {
        var _a;
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            initialKeyStates: (_a = {},
                _a[ONYXKEYS_1.default.SESSION] = {
                    email: CARLOS_EMAIL,
                    accountID: CARLOS_ACCOUNT_ID,
                },
                _a),
        });
    });
    afterEach(function () { return react_native_onyx_1.default.clear(); });
    it('should check if violation is dismissed or not', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transaction, transactionCollectionDataSet, isSmartScanDismissed, isDuplicateViolationDismissed;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    transaction = getFakeTransaction('123', {
                        dismissedViolations: { smartscanFailed: (_a = {}, _a[CARLOS_EMAIL] = CARLOS_ACCOUNT_ID.toString(), _a) },
                    });
                    transactionCollectionDataSet = (_b = {},
                        _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = transaction,
                        _b);
                    return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign({}, transactionCollectionDataSet))];
                case 1:
                    _c.sent();
                    isSmartScanDismissed = (0, TransactionUtils_1.isViolationDismissed)(transaction, smartScanFailedViolation);
                    isDuplicateViolationDismissed = (0, TransactionUtils_1.isViolationDismissed)(transaction, duplicatedTransactionViolation);
                    expect(isSmartScanDismissed).toBeTruthy();
                    expect(isDuplicateViolationDismissed).toBeFalsy();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return filtered out dismissed violations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transaction, transactionCollectionDataSet, transactionViolationsCollection, filteredViolations;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    transaction = getFakeTransaction('123', {
                        dismissedViolations: { smartscanFailed: (_a = {}, _a[CARLOS_EMAIL] = CARLOS_ACCOUNT_ID.toString(), _a) },
                    });
                    transactionCollectionDataSet = (_b = {},
                        _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = transaction,
                        _b);
                    transactionViolationsCollection = (_c = {},
                        _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID)] = [duplicatedTransactionViolation, smartScanFailedViolation, tagOutOfPolicyViolation],
                        _c);
                    return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign({}, transactionCollectionDataSet))];
                case 1:
                    _d.sent();
                    filteredViolations = (0, TransactionUtils_1.getTransactionViolations)(transaction, transactionViolationsCollection);
                    expect(filteredViolations).toEqual([duplicatedTransactionViolation, tagOutOfPolicyViolation]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('checks if transaction has warning type violation after filtering dismissed violations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transaction, transactionCollectionDataSet, transactionViolationsCollection, hasWarningTypeViolationRes;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    transaction = getFakeTransaction('123', {
                        dismissedViolations: { smartscanFailed: (_a = {}, _a[CARLOS_EMAIL] = CARLOS_ACCOUNT_ID.toString(), _a) },
                    });
                    transactionCollectionDataSet = (_b = {},
                        _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = transaction,
                        _b);
                    transactionViolationsCollection = (_c = {},
                        _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID)] = [duplicatedTransactionViolation, smartScanFailedViolation, tagOutOfPolicyViolation],
                        _c);
                    return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign({}, transactionCollectionDataSet))];
                case 1:
                    _d.sent();
                    hasWarningTypeViolationRes = (0, TransactionUtils_1.hasWarningTypeViolation)(transaction, transactionViolationsCollection);
                    expect(hasWarningTypeViolationRes).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
});
var brokenCardConnectionViolation = {
    name: CONST_1.default.VIOLATIONS.RTER,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    data: {
        brokenBankConnection: true,
        isAdmin: true,
        rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
    },
};
var brokenCardConnection530Violation = {
    name: CONST_1.default.VIOLATIONS.RTER,
    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
    data: {
        brokenBankConnection: true,
        isAdmin: false,
        rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530,
    },
};
describe('getViolationTranslation', function () {
    it('should return the correct message for broken card connection violation', function () {
        var brokenCardConnectionViolationExpected = (0, Localize_1.translateLocal)('violations.rter', {
            brokenBankConnection: true,
            isAdmin: true,
            rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            isTransactionOlderThan7Days: false,
        });
        expect(ViolationsUtils_1.default.getViolationTranslation(brokenCardConnectionViolation, Localize_1.translateLocal)).toBe(brokenCardConnectionViolationExpected);
        var brokenCardConnection530ViolationExpected = (0, Localize_1.translateLocal)('violations.rter', {
            brokenBankConnection: true,
            isAdmin: false,
            rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530,
            isTransactionOlderThan7Days: false,
        });
        expect(ViolationsUtils_1.default.getViolationTranslation(brokenCardConnection530Violation, Localize_1.translateLocal)).toBe(brokenCardConnection530ViolationExpected);
    });
});
describe('getRBRMessages', function () {
    var mockTransaction = {
        transactionID: 'test-transaction-id',
        reportID: 'test-report-id',
        amount: 100,
        currency: CONST_1.default.CURRENCY.USD,
        created: '2023-07-24 13:46:20',
        merchant: 'Test Merchant',
    };
    it('should return all violations and missing field error', function () {
        var violations = [
            {
                name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
            },
            {
                name: CONST_1.default.VIOLATIONS.MISSING_TAG,
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
            },
        ];
        var missingFieldError = 'Missing required field';
        var result = ViolationsUtils_1.default.getRBRMessages(mockTransaction, violations, Localize_1.translateLocal, missingFieldError, []);
        var expectedResult = "Missing required field. ".concat((0, Localize_1.translateLocal)('violations.missingCategory'), ". ").concat((0, Localize_1.translateLocal)('violations.missingTag'), ".");
        expect(result).toBe(expectedResult);
    });
    it('should filter out empty strings', function () {
        var violations = [
            {
                name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
            },
            {
                name: '',
                type: '',
            },
            {
                name: CONST_1.default.VIOLATIONS.MISSING_TAG,
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
            },
        ];
        var result = ViolationsUtils_1.default.getRBRMessages(mockTransaction, violations, Localize_1.translateLocal, undefined, []);
        var expectedResult = "".concat((0, Localize_1.translateLocal)('violations.missingCategory'), ". ").concat((0, Localize_1.translateLocal)('violations.missingTag'), ".");
        expect(result).toBe(expectedResult);
    });
});
