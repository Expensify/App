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
exports.formatDefaultTaxRateText = formatDefaultTaxRateText;
exports.formatRequireReceiptsOverText = formatRequireReceiptsOverText;
exports.getCategoryApproverRule = getCategoryApproverRule;
exports.getCategoryExpenseRule = getCategoryExpenseRule;
exports.getCategoryDefaultTaxRate = getCategoryDefaultTaxRate;
exports.updateCategoryInMccGroup = updateCategoryInMccGroup;
exports.getEnabledCategoriesCount = getEnabledCategoriesCount;
exports.isCategoryMissing = isCategoryMissing;
var CONST_1 = require("@src/CONST");
var CurrencyUtils_1 = require("./CurrencyUtils");
function formatDefaultTaxRateText(translate, taxID, taxRate, policyTaxRates) {
    var taxRateText = "".concat(taxRate.name, " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat(taxRate.value);
    if (!policyTaxRates) {
        return taxRateText;
    }
    var defaultExternalID = policyTaxRates.defaultExternalID, foreignTaxDefault = policyTaxRates.foreignTaxDefault;
    var suffix;
    if (taxID === defaultExternalID && taxID === foreignTaxDefault) {
        suffix = translate('common.default');
    }
    else if (taxID === defaultExternalID) {
        suffix = translate('workspace.taxes.workspaceDefault');
    }
    else if (taxID === foreignTaxDefault) {
        suffix = translate('workspace.taxes.foreignDefault');
    }
    return "".concat(taxRateText).concat(suffix ? " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(suffix) : "");
}
function formatRequireReceiptsOverText(translate, policy, categoryMaxAmountNoReceipt) {
    var _a;
    var isAlwaysSelected = categoryMaxAmountNoReceipt === 0;
    var isNeverSelected = categoryMaxAmountNoReceipt === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE;
    if (isAlwaysSelected) {
        return translate("workspace.rules.categoryRules.requireReceiptsOverList.always");
    }
    if (isNeverSelected) {
        return translate("workspace.rules.categoryRules.requireReceiptsOverList.never");
    }
    var maxExpenseAmountToDisplay = (policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt) === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE ? 0 : policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt;
    return translate("workspace.rules.categoryRules.requireReceiptsOverList.default", {
        defaultAmount: (0, CurrencyUtils_1.convertToShortDisplayString)(maxExpenseAmountToDisplay, (_a = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _a !== void 0 ? _a : CONST_1.default.CURRENCY.USD),
    });
}
function getCategoryApproverRule(approvalRules, categoryName) {
    var approverRule = approvalRules === null || approvalRules === void 0 ? void 0 : approvalRules.find(function (rule) {
        return rule.applyWhen.find(function (_a) {
            var condition = _a.condition, field = _a.field, value = _a.value;
            return condition === CONST_1.default.POLICY.RULE_CONDITIONS.MATCHES && field === CONST_1.default.POLICY.FIELDS.CATEGORY && value === categoryName;
        });
    });
    return approverRule;
}
function getCategoryExpenseRule(expenseRules, categoryName) {
    var expenseRule = expenseRules === null || expenseRules === void 0 ? void 0 : expenseRules.find(function (rule) {
        return rule.applyWhen.find(function (_a) {
            var condition = _a.condition, field = _a.field, value = _a.value;
            return condition === CONST_1.default.POLICY.RULE_CONDITIONS.MATCHES && field === CONST_1.default.POLICY.FIELDS.CATEGORY && value === categoryName;
        });
    });
    return expenseRule;
}
function getCategoryDefaultTaxRate(expenseRules, categoryName, defaultTaxRate) {
    var _a, _b, _c;
    var categoryDefaultTaxRate = (_c = (_b = (_a = expenseRules === null || expenseRules === void 0 ? void 0 : expenseRules.find(function (rule) { return rule.applyWhen.some(function (when) { return when.value === categoryName; }); })) === null || _a === void 0 ? void 0 : _a.tax) === null || _b === void 0 ? void 0 : _b.field_id_TAX) === null || _c === void 0 ? void 0 : _c.externalID;
    // If the default taxRate is not found in expenseRules, use the default value for policy
    if (!categoryDefaultTaxRate) {
        return defaultTaxRate;
    }
    return categoryDefaultTaxRate;
}
function updateCategoryInMccGroup(mccGroups, oldCategoryName, newCategoryName, shouldClearPendingAction) {
    if (oldCategoryName === newCategoryName) {
        return mccGroups;
    }
    var updatedGroups = {};
    for (var _i = 0, _a = Object.entries(mccGroups || {}); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], group = _b[1];
        updatedGroups[key] =
            group.category === oldCategoryName ? __assign(__assign({}, group), { category: newCategoryName, pendingAction: shouldClearPendingAction ? null : CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }) : group;
    }
    return updatedGroups;
}
/**
 * Calculates count of all enabled options
 */
function getEnabledCategoriesCount(policyCategories) {
    if (policyCategories === undefined) {
        return 0;
    }
    return Object.values(policyCategories).filter(function (policyCategory) { return policyCategory.enabled; }).length;
}
function isCategoryMissing(category) {
    if (!category) {
        return true;
    }
    var emptyCategories = CONST_1.default.SEARCH.CATEGORY_EMPTY_VALUE.split(',');
    return emptyCategories.includes(category !== null && category !== void 0 ? category : '');
}
