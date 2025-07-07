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
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var SearchActions = require("@userActions/Search");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersExpenseTypePage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM)[0];
    var initiallySelectedItems = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.expenseType) === null || _a === void 0 ? void 0 : _a.filter(function (expenseType) { return Object.values(CONST_1.default.SEARCH.TRANSACTION_TYPE).includes(expenseType); }).map(function (expenseType) {
            var expenseTypeName = translate((0, SearchUIUtils_1.getExpenseTypeTranslationKey)(expenseType));
            return { name: expenseTypeName, value: expenseType };
        });
    }, [searchAdvancedFiltersForm, translate]);
    var allExpenseTypes = Object.values(CONST_1.default.SEARCH.TRANSACTION_TYPE);
    var expenseTypesItems = (0, react_1.useMemo)(function () {
        return allExpenseTypes.map(function (expenseType) {
            var expenseTypeName = translate((0, SearchUIUtils_1.getExpenseTypeTranslationKey)(expenseType));
            return { name: expenseTypeName, value: expenseType };
        });
    }, [allExpenseTypes, translate]);
    var updateExpenseTypeFilter = (0, react_1.useCallback)(function (values) { return SearchActions.updateAdvancedFilters({ expenseType: values }); }, []);
    return (<ScreenWrapper_1.default testID={SearchFiltersExpenseTypePage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} includeSafeAreaPaddingBottom={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('search.expenseType')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker_1.default items={expenseTypesItems} initiallySelectedItems={initiallySelectedItems} onSaveSelection={updateExpenseTypeFilter} shouldShowTextInput={false}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SearchFiltersExpenseTypePage.displayName = 'SearchFiltersExpenseTypePage';
exports.default = SearchFiltersExpenseTypePage;
