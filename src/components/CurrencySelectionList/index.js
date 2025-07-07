"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectableListItem_1 = require("@components/SelectionList/SelectableListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var getMatchScore_1 = require("@libs/getMatchScore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function CurrencySelectionList(_a) {
    var searchInputLabel = _a.searchInputLabel, initiallySelectedCurrencyCode = _a.initiallySelectedCurrencyCode, onSelect = _a.onSelect, _b = _a.selectedCurrencies, selectedCurrencies = _b === void 0 ? [] : _b, _c = _a.canSelectMultiple, canSelectMultiple = _c === void 0 ? false : _c, recentlyUsedCurrencies = _a.recentlyUsedCurrencies, _d = _a.excludedCurrencies, excludedCurrencies = _d === void 0 ? [] : _d, restProps = __rest(_a, ["searchInputLabel", "initiallySelectedCurrencyCode", "onSelect", "selectedCurrencies", "canSelectMultiple", "recentlyUsedCurrencies", "excludedCurrencies"]);
    var currencyList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: false })[0];
    var _e = (0, react_1.useState)(''), searchValue = _e[0], setSearchValue = _e[1];
    var translate = (0, useLocalize_1.default)().translate;
    var getUnselectedOptions = (0, react_1.useCallback)(function (options) { return options.filter(function (option) { return !option.isSelected; }); }, []);
    var _f = (0, react_1.useMemo)(function () {
        var currencyOptions = Object.entries(currencyList !== null && currencyList !== void 0 ? currencyList : {}).reduce(function (acc, _a) {
            var _b;
            var currencyCode = _a[0], currencyInfo = _a[1];
            var isSelectedCurrency = currencyCode === initiallySelectedCurrencyCode || selectedCurrencies.includes(currencyCode);
            if (!excludedCurrencies.includes(currencyCode) && (isSelectedCurrency || !(currencyInfo === null || currencyInfo === void 0 ? void 0 : currencyInfo.retired))) {
                acc.push({
                    currencyName: (_b = currencyInfo === null || currencyInfo === void 0 ? void 0 : currencyInfo.name) !== null && _b !== void 0 ? _b : '',
                    text: "".concat(currencyCode, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(currencyCode)),
                    currencyCode: currencyCode,
                    keyForList: currencyCode,
                    isSelected: isSelectedCurrency,
                });
            }
            return acc;
        }, []);
        var recentlyUsedCurrencyOptions = Array.isArray(recentlyUsedCurrencies)
            ? recentlyUsedCurrencies === null || recentlyUsedCurrencies === void 0 ? void 0 : recentlyUsedCurrencies.map(function (currencyCode) {
                var _a;
                var currencyInfo = currencyList === null || currencyList === void 0 ? void 0 : currencyList[currencyCode];
                var isSelectedCurrency = currencyCode === initiallySelectedCurrencyCode;
                return {
                    currencyName: (_a = currencyInfo === null || currencyInfo === void 0 ? void 0 : currencyInfo.name) !== null && _a !== void 0 ? _a : '',
                    text: "".concat(currencyCode, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(currencyCode)),
                    currencyCode: currencyCode,
                    keyForList: currencyCode,
                    isSelected: isSelectedCurrency,
                };
            })
            : [];
        var searchRegex = new RegExp(expensify_common_1.Str.escapeForRegExp(searchValue.trim()), 'i');
        var filteredCurrencies = currencyOptions
            .filter(function (currencyOption) { var _a; return searchRegex.test((_a = currencyOption.text) !== null && _a !== void 0 ? _a : '') || searchRegex.test(currencyOption.currencyName); })
            .sort(function (currency1, currency2) { var _a, _b; return (0, getMatchScore_1.default)((_a = currency2.text) !== null && _a !== void 0 ? _a : '', searchValue) - (0, getMatchScore_1.default)((_b = currency1.text) !== null && _b !== void 0 ? _b : '', searchValue); });
        var isEmpty = searchValue.trim() && !filteredCurrencies.length;
        var shouldDisplayRecentlyOptions = !(0, EmptyObject_1.isEmptyObject)(recentlyUsedCurrencyOptions) && !searchValue;
        var selectedOptions = filteredCurrencies.filter(function (option) { return option.isSelected; });
        var shouldDisplaySelectedOptionOnTop = selectedOptions.length > 0;
        var unselectedOptions = getUnselectedOptions(filteredCurrencies);
        var result = [];
        if (shouldDisplaySelectedOptionOnTop) {
            result.push({
                title: '',
                data: selectedOptions,
                shouldShow: true,
            });
        }
        if (shouldDisplayRecentlyOptions) {
            if (!isEmpty) {
                result.push({
                    title: translate('common.recents'),
                    data: shouldDisplaySelectedOptionOnTop ? getUnselectedOptions(recentlyUsedCurrencyOptions) : recentlyUsedCurrencyOptions,
                    shouldShow: shouldDisplayRecentlyOptions,
                }, { title: translate('common.all'), data: shouldDisplayRecentlyOptions ? unselectedOptions : filteredCurrencies });
            }
        }
        else if (!isEmpty) {
            result.push({
                data: shouldDisplaySelectedOptionOnTop ? unselectedOptions : filteredCurrencies,
            });
        }
        return { sections: result, headerMessage: isEmpty ? translate('common.noResultsFound') : '' };
    }, [currencyList, recentlyUsedCurrencies, searchValue, getUnselectedOptions, translate, initiallySelectedCurrencyCode, selectedCurrencies, excludedCurrencies]), sections = _f.sections, headerMessage = _f.headerMessage;
    return (<SelectionList_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...restProps} sections={sections} ListItem={canSelectMultiple ? SelectableListItem_1.default : RadioListItem_1.default} textInputLabel={searchInputLabel} textInputValue={searchValue} onChangeText={setSearchValue} onSelectRow={onSelect} shouldSingleExecuteRowSelect headerMessage={headerMessage} initiallyFocusedOptionKey={initiallySelectedCurrencyCode} showScrollIndicator canSelectMultiple={canSelectMultiple}/>);
}
CurrencySelectionList.displayName = 'CurrencySelectionList';
exports.default = CurrencySelectionList;
