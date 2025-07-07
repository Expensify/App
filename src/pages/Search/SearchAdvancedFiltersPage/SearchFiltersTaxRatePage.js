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
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SearchActions = require("@userActions/Search");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersTaxRatePage() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM)[0];
    var allTaxRates = (0, PolicyUtils_1.getAllTaxRates)();
    var selectedTaxesItems = [];
    Object.entries(allTaxRates).forEach(function (_a) {
        var _b;
        var taxRateName = _a[0], taxRateKeys = _a[1];
        (_b = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.taxRate) === null || _b === void 0 ? void 0 : _b.forEach(function (taxRateKey) {
            if (!taxRateKeys.includes(taxRateKey) || selectedTaxesItems.some(function (item) { return item.name === taxRateName; })) {
                return;
            }
            selectedTaxesItems.push({ name: taxRateName, value: taxRateKeys });
        });
    });
    var policyID = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var singlePolicyTaxRates = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes;
    var taxItems = (0, react_1.useMemo)(function () {
        if (!singlePolicyTaxRates) {
            return Object.entries(allTaxRates).map(function (_a) {
                var taxRateName = _a[0], taxRateKeys = _a[1];
                return ({ name: taxRateName, value: taxRateKeys });
            });
        }
        return Object.entries(singlePolicyTaxRates).map(function (_a) {
            var taxRateKey = _a[0], taxRate = _a[1];
            return ({ name: taxRate.name, value: [taxRateKey] });
        });
    }, [allTaxRates, singlePolicyTaxRates]);
    var updateTaxRateFilters = (0, react_1.useCallback)(function (values) { return SearchActions.updateAdvancedFilters({ taxRate: values }); }, []);
    return (<ScreenWrapper_1.default testID={SearchFiltersTaxRatePage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('workspace.taxes.taxRate')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker_1.default items={taxItems} initiallySelectedItems={selectedTaxesItems} onSaveSelection={updateTaxRateFilters}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SearchFiltersTaxRatePage.displayName = 'SearchFiltersTaxRatePage';
exports.default = SearchFiltersTaxRatePage;
