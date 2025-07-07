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
var react_1 = require("react");
var react_native_1 = require("react-native");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchFilterPageFooterButtons_1 = require("@components/Search/SearchFilterPageFooterButtons");
var SelectionList_1 = require("@components/SelectionList");
var SingleSelectListItem_1 = require("@components/SelectionList/SingleSelectListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersTypePage() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true })[0];
    var _b = (0, react_1.useState)((_a = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.type) !== null && _a !== void 0 ? _a : CONST_1.default.SEARCH.DATA_TYPES.EXPENSE), selectedItem = _b[0], setSelectedItem = _b[1];
    var listData = (0, react_1.useMemo)(function () {
        return (0, SearchUIUtils_1.getTypeOptions)(allPolicies, session === null || session === void 0 ? void 0 : session.email).map(function (typeOption) { return ({
            text: translate(typeOption.translation),
            keyForList: typeOption.value,
            isSelected: selectedItem === typeOption.value,
        }); });
    }, [allPolicies, selectedItem, session === null || session === void 0 ? void 0 : session.email, translate]);
    var updateSelectedItem = (0, react_1.useCallback)(function (type) {
        var _a;
        setSelectedItem((_a = type === null || type === void 0 ? void 0 : type.keyForList) !== null && _a !== void 0 ? _a : CONST_1.default.SEARCH.DATA_TYPES.EXPENSE);
    }, []);
    var resetChanges = (0, react_1.useCallback)(function () {
        setSelectedItem(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE);
    }, []);
    var applyChanges = (0, react_1.useCallback)(function () {
        var hasTypeChanged = selectedItem !== (searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.type);
        var updatedFilters = __assign({ type: selectedItem }, (hasTypeChanged && {
            groupBy: null,
            status: CONST_1.default.SEARCH.STATUS.EXPENSE.ALL,
        }));
        (0, Search_1.updateAdvancedFilters)(updatedFilters);
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    }, [searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.type, selectedItem]);
    return (<ScreenWrapper_1.default testID={SearchFiltersTypePage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('common.type')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SelectionList_1.default shouldSingleExecuteRowSelect sections={[{ data: listData }]} ListItem={SingleSelectListItem_1.default} onSelectRow={updateSelectedItem}/>
            </react_native_1.View>
            <FixedFooter_1.default style={styles.mtAuto}>
                <SearchFilterPageFooterButtons_1.default resetChanges={resetChanges} applyChanges={applyChanges}/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
SearchFiltersTypePage.displayName = 'SearchFiltersTypePage';
exports.default = SearchFiltersTypePage;
