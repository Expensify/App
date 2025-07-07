"use strict";
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
var react_native_1 = require("react-native");
var FixedFooter_1 = require("@components/FixedFooter");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchFilterPageFooterButtons_1 = require("@components/Search/SearchFilterPageFooterButtons");
var SelectionList_1 = require("@components/SelectionList");
var MultiSelectListItem_1 = require("@components/SelectionList/MultiSelectListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersStatusPage() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true }), searchAdvancedFiltersForm = _b[0], searchAdvancedFiltersFormResult = _b[1];
    var currentType = (_a = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.type) !== null && _a !== void 0 ? _a : CONST_1.default.SEARCH.DATA_TYPES.EXPENSE;
    var currentGroupBy = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.groupBy;
    var _c = (0, react_1.useState)(function () {
        if (!(searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.status) || searchAdvancedFiltersForm.status === CONST_1.default.SEARCH.STATUS.EXPENSE.ALL) {
            return [];
        }
        if (typeof searchAdvancedFiltersForm.status === 'string') {
            return searchAdvancedFiltersForm.status.split(',');
        }
        return searchAdvancedFiltersForm.status;
    }), selectedItems = _c[0], setSelectedItems = _c[1];
    var items = (0, react_1.useMemo)(function () { return (0, SearchUIUtils_1.getStatusOptions)(currentType, currentGroupBy); }, [currentGroupBy, currentType]);
    var listData = (0, react_1.useMemo)(function () {
        return items.map(function (statusOption) { return ({
            text: translate(statusOption.translation),
            keyForList: statusOption.value,
            isSelected: selectedItems.includes(statusOption.value),
        }); });
    }, [items, selectedItems, translate]);
    var updateSelectedItems = (0, react_1.useCallback)(function (listItem) {
        var _a;
        if (listItem.isSelected) {
            setSelectedItems(selectedItems.filter(function (i) { return i !== listItem.keyForList; }));
            return;
        }
        var newItem = (_a = items.find(function (i) { return i.value === listItem.keyForList; })) === null || _a === void 0 ? void 0 : _a.value;
        if (newItem) {
            setSelectedItems(__spreadArray(__spreadArray([], selectedItems, true), [newItem], false));
        }
    }, [items, selectedItems]);
    var resetChanges = (0, react_1.useCallback)(function () {
        setSelectedItems([]);
    }, []);
    var applyChanges = (0, react_1.useCallback)(function () {
        var newStatus = selectedItems.length ? selectedItems : CONST_1.default.SEARCH.STATUS.EXPENSE.ALL;
        (0, Search_1.updateAdvancedFilters)({
            status: newStatus,
        });
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    }, [selectedItems]);
    if (searchAdvancedFiltersFormResult.status === 'loading') {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default testID={SearchFiltersStatusPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('common.status')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SelectionList_1.default shouldSingleExecuteRowSelect sections={[{ data: listData }]} ListItem={MultiSelectListItem_1.default} onSelectRow={updateSelectedItems}/>
            </react_native_1.View>
            <FixedFooter_1.default style={styles.mtAuto}>
                <SearchFilterPageFooterButtons_1.default resetChanges={resetChanges} applyChanges={applyChanges}/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
SearchFiltersStatusPage.displayName = 'SearchFiltersStatusPage';
exports.default = SearchFiltersStatusPage;
