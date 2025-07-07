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
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
/**
 * Names of Fields where violations can occur.
 */
var validationFields = ['amount', 'billable', 'category', 'comment', 'date', 'merchant', 'receipt', 'tag', 'tax', 'customUnitRateID', 'none'];
/**
 * Map from Violation Names to the field where that violation can occur.
 */
var violationNameToField = {
    allTagLevelsRequired: function () { return 'tag'; },
    autoReportedRejectedExpense: function () { return 'merchant'; },
    billableExpense: function () { return 'billable'; },
    cashExpenseWithNoReceipt: function () { return 'receipt'; },
    categoryOutOfPolicy: function () { return 'category'; },
    conversionSurcharge: function () { return 'amount'; },
    customUnitOutOfPolicy: function () { return 'customUnitRateID'; },
    duplicatedTransaction: function () { return 'merchant'; },
    fieldRequired: function () { return 'merchant'; },
    futureDate: function () { return 'date'; },
    invoiceMarkup: function () { return 'amount'; },
    maxAge: function () { return 'date'; },
    missingCategory: function () { return 'category'; },
    missingComment: function () { return 'comment'; },
    missingTag: function () { return 'tag'; },
    modifiedAmount: function () { return 'amount'; },
    modifiedDate: function () { return 'date'; },
    nonExpensiworksExpense: function () { return 'merchant'; },
    overAutoApprovalLimit: function () { return 'amount'; },
    overCategoryLimit: function () { return 'amount'; },
    overLimit: function () { return 'amount'; },
    overLimitAttendee: function () { return 'amount'; },
    perDayLimit: function () { return 'amount'; },
    prohibitedExpense: function () { return 'receipt'; },
    receiptNotSmartScanned: function () { return 'receipt'; },
    receiptRequired: function () { return 'receipt'; },
    customRules: function (violation) {
        var _a;
        if (!((_a = violation === null || violation === void 0 ? void 0 : violation.data) === null || _a === void 0 ? void 0 : _a.field)) {
            return 'receipt';
        }
        var field = violation.data.field;
        return validationFields.includes(field) ? field : 'receipt';
    },
    rter: function () { return 'merchant'; },
    smartscanFailed: function () { return 'receipt'; },
    someTagLevelsRequired: function () { return 'tag'; },
    tagOutOfPolicy: function () { return 'tag'; },
    taxRateChanged: function () { return 'tax'; },
    taxAmountChanged: function () { return 'tax'; },
    taxOutOfPolicy: function () { return 'tax'; },
    taxRequired: function () { return 'tax'; },
    hold: function () { return 'none'; },
    receiptGeneratedWithAI: function () { return 'receipt'; },
};
/**
 * @param violations – List of transaction violations
 * @param shouldShowOnlyViolations – Whether we should only show violations of type 'violation'
 */
function useViolations(violations, shouldShowOnlyViolations) {
    var violationsByField = (0, react_1.useMemo)(function () {
        var _a, _b;
        var filteredViolations = violations.filter(function (violation) {
            if (shouldShowOnlyViolations) {
                return violation.type === CONST_1.default.VIOLATION_TYPES.VIOLATION;
            }
            return true;
        });
        var violationGroups = new Map();
        for (var _i = 0, filteredViolations_1 = filteredViolations; _i < filteredViolations_1.length; _i++) {
            var violation = filteredViolations_1[_i];
            var field = (_a = violationNameToField[violation.name]) === null || _a === void 0 ? void 0 : _a.call(violationNameToField, violation);
            var existingViolations = (_b = violationGroups.get(field)) !== null && _b !== void 0 ? _b : [];
            violationGroups.set(field, __spreadArray(__spreadArray([], existingViolations, true), [violation], false));
        }
        return violationGroups !== null && violationGroups !== void 0 ? violationGroups : new Map();
    }, [violations, shouldShowOnlyViolations]);
    var getViolationsForField = (0, react_1.useCallback)(function (field, data, policyHasDependentTags, tagValue) {
        var _a, _b, _c;
        if (policyHasDependentTags === void 0) { policyHasDependentTags = false; }
        var currentViolations = (_a = violationsByField.get(field)) !== null && _a !== void 0 ? _a : [];
        var firstViolation = currentViolations.at(0);
        // someTagLevelsRequired has special logic because data.errorIndexes is a bit unique in how it denotes the tag list that has the violation
        // tagListIndex can be 0 so we compare with undefined
        if ((firstViolation === null || firstViolation === void 0 ? void 0 : firstViolation.name) === CONST_1.default.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED && (data === null || data === void 0 ? void 0 : data.tagListIndex) !== undefined && Array.isArray((_b = firstViolation === null || firstViolation === void 0 ? void 0 : firstViolation.data) === null || _b === void 0 ? void 0 : _b.errorIndexes)) {
            return currentViolations
                .filter(function (violation) { var _a, _b, _c; return (_b = (_a = violation.data) === null || _a === void 0 ? void 0 : _a.errorIndexes) === null || _b === void 0 ? void 0 : _b.includes((_c = data === null || data === void 0 ? void 0 : data.tagListIndex) !== null && _c !== void 0 ? _c : -1); })
                .map(function (violation) { return (__assign(__assign({}, violation), { data: __assign(__assign({}, violation.data), { tagName: data === null || data === void 0 ? void 0 : data.tagListName }) })); });
        }
        // missingTag has special logic for policies with dependent tags, because only one violation is returned for all tags
        // when no tags are present, so the tag name isn't set in the violation data. That's why we add it here
        if (policyHasDependentTags && (firstViolation === null || firstViolation === void 0 ? void 0 : firstViolation.name) === CONST_1.default.VIOLATIONS.MISSING_TAG && (data === null || data === void 0 ? void 0 : data.tagListName)) {
            return [
                __assign(__assign({}, firstViolation), { data: __assign(__assign({}, firstViolation.data), { tagName: data === null || data === void 0 ? void 0 : data.tagListName }) }),
            ];
        }
        // tagOutOfPolicy has special logic because we have to account for multi-level tags and use tagName to find the right tag to put the violation on
        if ((firstViolation === null || firstViolation === void 0 ? void 0 : firstViolation.name) === CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY && (data === null || data === void 0 ? void 0 : data.tagListName) !== undefined && ((_c = firstViolation === null || firstViolation === void 0 ? void 0 : firstViolation.data) === null || _c === void 0 ? void 0 : _c.tagName)) {
            return currentViolations.filter(function (violation) { var _a; return ((_a = violation.data) === null || _a === void 0 ? void 0 : _a.tagName) === (data === null || data === void 0 ? void 0 : data.tagListName); });
        }
        // allTagLevelsRequired has special logic because it is returned when one but not all the tags are set,
        // so we need to return the violation for the tag fields without a tag set
        if ((firstViolation === null || firstViolation === void 0 ? void 0 : firstViolation.name) === CONST_1.default.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED && tagValue) {
            return currentViolations.filter(function (violation) { var _a; return ((_a = violation.data) === null || _a === void 0 ? void 0 : _a.tagName) === (data === null || data === void 0 ? void 0 : data.tagListName); });
        }
        return currentViolations;
    }, [violationsByField]);
    return {
        getViolationsForField: getViolationsForField,
    };
}
exports.default = useViolations;
