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
var Search_1 = require("@userActions/Search");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersCategoryPage() {
    var _a, _b;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true })[0];
    var selectedCategoriesItems = (_a = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.category) === null || _a === void 0 ? void 0 : _a.map(function (category) {
        if (category === CONST_1.default.SEARCH.CATEGORY_EMPTY_VALUE) {
            return { name: translate('search.noCategory'), value: category };
        }
        return { name: category, value: category };
    });
    // eslint-disable-next-line rulesdir/no-default-id-values
    var policyID = (_b = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.policyID) !== null && _b !== void 0 ? _b : '-1';
    var allPolicyCategories = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES, { canBeMissing: true })[0];
    var singlePolicyCategories = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID)];
    var categoryItems = (0, react_1.useMemo)(function () {
        var items = [{ name: translate('search.noCategory'), value: CONST_1.default.SEARCH.CATEGORY_EMPTY_VALUE }];
        if (!singlePolicyCategories) {
            var uniqueCategoryNames_1 = new Set();
            Object.values(allPolicyCategories !== null && allPolicyCategories !== void 0 ? allPolicyCategories : {}).map(function (policyCategories) { return Object.values(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}).forEach(function (category) { return uniqueCategoryNames_1.add(category.name); }); });
            items.push.apply(items, Array.from(uniqueCategoryNames_1).map(function (categoryName) { return ({ name: categoryName, value: categoryName }); }));
        }
        else {
            items.push.apply(items, Object.values(singlePolicyCategories !== null && singlePolicyCategories !== void 0 ? singlePolicyCategories : {}).map(function (category) { return ({ name: category.name, value: category.name }); }));
        }
        return items;
    }, [allPolicyCategories, singlePolicyCategories, translate]);
    var onSaveSelection = (0, react_1.useCallback)(function (values) { return (0, Search_1.updateAdvancedFilters)({ category: values }); }, []);
    return (<ScreenWrapper_1.default testID={SearchFiltersCategoryPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('common.category')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker_1.default items={categoryItems} initiallySelectedItems={selectedCategoriesItems} onSaveSelection={onSaveSelection}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SearchFiltersCategoryPage.displayName = 'SearchFiltersCategoryPage';
exports.default = SearchFiltersCategoryPage;
