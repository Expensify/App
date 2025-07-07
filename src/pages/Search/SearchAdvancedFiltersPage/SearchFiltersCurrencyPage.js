"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchMultipleSelectionPicker_1 = require("@components/Search/SearchMultipleSelectionPicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersCurrencyPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var currencyList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST)[0];
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM)[0];
    var selectedCurrenciesCodes = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.currency;
    var _a = (0, react_1.useMemo)(function () {
        var selectedCurrencies = [];
        var currencies = [];
        Object.keys(currencyList !== null && currencyList !== void 0 ? currencyList : {}).forEach(function (currencyCode) {
            var _a;
            if ((_a = currencyList === null || currencyList === void 0 ? void 0 : currencyList[currencyCode]) === null || _a === void 0 ? void 0 : _a.retired) {
                return;
            }
            if ((selectedCurrenciesCodes === null || selectedCurrenciesCodes === void 0 ? void 0 : selectedCurrenciesCodes.includes(currencyCode)) && !selectedCurrencies.some(function (currencyItem) { return currencyItem.value === currencyCode; })) {
                selectedCurrencies.push({ name: "".concat(currencyCode, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(currencyCode)), value: currencyCode });
            }
            if (!currencies.some(function (item) { return item.value === currencyCode; })) {
                currencies.push({ name: "".concat(currencyCode, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(currencyCode)), value: currencyCode });
            }
        });
        return { selectedCurrenciesItems: selectedCurrencies, currencyItems: currencies };
    }, [currencyList, selectedCurrenciesCodes]), selectedCurrenciesItems = _a.selectedCurrenciesItems, currencyItems = _a.currencyItems;
    var handleOnSubmit = function (values) {
        (0, Search_1.updateAdvancedFilters)({ currency: values });
    };
    return (<ScreenWrapper_1.default testID={SearchFiltersCurrencyPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('search.filters.currency')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker_1.default items={currencyItems} initiallySelectedItems={selectedCurrenciesItems} onSaveSelection={handleOnSubmit}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SearchFiltersCurrencyPage.displayName = 'SearchFiltersCurrencyPage';
exports.default = SearchFiltersCurrencyPage;
