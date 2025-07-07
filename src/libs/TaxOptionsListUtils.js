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
exports.getTaxRatesSection = getTaxRatesSection;
exports.sortTaxRates = sortTaxRates;
exports.getTaxRatesOptions = getTaxRatesOptions;
var CONST_1 = require("@src/CONST");
var LocaleCompare_1 = require("./LocaleCompare");
var tokenizedSearch_1 = require("./tokenizedSearch");
var TransactionUtils_1 = require("./TransactionUtils");
/**
 * Sorts tax rates alphabetically by name.
 */
function sortTaxRates(taxRates) {
    var sortedTaxRates = Object.values(taxRates).sort(function (a, b) { return (0, LocaleCompare_1.default)(a.name, b.name); });
    return sortedTaxRates;
}
/**
 * Builds the options for taxRates
 */
function getTaxRatesOptions(taxRates) {
    return taxRates.map(function (_a) {
        var code = _a.code, modifiedName = _a.modifiedName, isDisabled = _a.isDisabled, isSelected = _a.isSelected, pendingAction = _a.pendingAction;
        return ({
            code: code,
            text: modifiedName,
            keyForList: modifiedName,
            searchText: modifiedName,
            tooltipText: modifiedName,
            isDisabled: !!isDisabled || pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            isSelected: isSelected,
            pendingAction: pendingAction,
        });
    });
}
/**
 * Builds the section list for tax rates
 */
function getTaxRatesSection(_a) {
    var policy = _a.policy, searchValue = _a.searchValue, _b = _a.selectedOptions, selectedOptions = _b === void 0 ? [] : _b, transaction = _a.transaction;
    var policyRatesSections = [];
    var taxes = (0, TransactionUtils_1.transformedTaxRates)(policy, transaction);
    var sortedTaxRates = sortTaxRates(taxes);
    var selectedOptionNames = selectedOptions.map(function (selectedOption) { return selectedOption.modifiedName; });
    var enabledTaxRates = sortedTaxRates.filter(function (taxRate) { return !taxRate.isDisabled; });
    var enabledTaxRatesNames = enabledTaxRates.map(function (tax) { return tax.modifiedName; });
    var enabledTaxRatesWithoutSelectedOptions = enabledTaxRates.filter(function (tax) { return tax.modifiedName && !selectedOptionNames.includes(tax.modifiedName); });
    var selectedTaxRateWithDisabledState = [];
    var numberOfTaxRates = enabledTaxRates.length;
    selectedOptions.forEach(function (tax) {
        if (enabledTaxRatesNames.includes(tax.modifiedName)) {
            selectedTaxRateWithDisabledState.push(__assign(__assign({}, tax), { isDisabled: false, isSelected: true }));
            return;
        }
        selectedTaxRateWithDisabledState.push(__assign(__assign({}, tax), { isDisabled: true, isSelected: true }));
    });
    // If all tax are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTaxRates === 0 && selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data: getTaxRatesOptions(selectedTaxRateWithDisabledState),
        });
        return policyRatesSections;
    }
    if (searchValue) {
        var taxesForSearch = __spreadArray(__spreadArray([], (0, tokenizedSearch_1.default)(selectedTaxRateWithDisabledState, searchValue, function (taxRate) { var _a; return [(_a = taxRate.modifiedName) !== null && _a !== void 0 ? _a : '']; }), true), (0, tokenizedSearch_1.default)(enabledTaxRatesWithoutSelectedOptions, searchValue, function (taxRate) { var _a; return [(_a = taxRate.modifiedName) !== null && _a !== void 0 ? _a : '']; }), true);
        policyRatesSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data: getTaxRatesOptions(taxesForSearch),
        });
        return policyRatesSections;
    }
    if (numberOfTaxRates < CONST_1.default.STANDARD_LIST_ITEM_LIMIT) {
        policyRatesSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data: getTaxRatesOptions(__spreadArray(__spreadArray([], selectedTaxRateWithDisabledState, true), enabledTaxRatesWithoutSelectedOptions, true)),
        });
        return policyRatesSections;
    }
    if (selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            data: getTaxRatesOptions(selectedTaxRateWithDisabledState),
        });
    }
    policyRatesSections.push({
        // "All" section when number of items are more than the threshold
        title: '',
        shouldShow: true,
        data: getTaxRatesOptions(enabledTaxRatesWithoutSelectedOptions),
    });
    return policyRatesSections;
}
