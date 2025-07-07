"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var SingleSelectListItem_1 = require("@components/SelectionList/SingleSelectListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Search_1 = require("@userActions/Search");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SearchFilterPageFooterButtons_1 = require("./SearchFilterPageFooterButtons");
function SearchBooleanFilterBase(_a) {
    var booleanKey = _a.booleanKey, titleKey = _a.titleKey;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var booleanValues = Object.values(CONST_1.default.SEARCH.BOOLEAN);
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true })[0];
    var _b = (0, react_1.useState)(function () {
        var _a;
        return (_a = booleanValues.find(function (value) { return (searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm[booleanKey]) === value; })) !== null && _a !== void 0 ? _a : null;
    }), selectedItem = _b[0], setSelectedItem = _b[1];
    var items = (0, react_1.useMemo)(function () {
        return booleanValues.map(function (value) { return ({
            value: value,
            keyForList: value,
            text: translate("common.".concat(value)),
            isSelected: selectedItem === value,
        }); });
    }, [selectedItem, translate, booleanValues]);
    var updateFilter = (0, react_1.useCallback)(function (selectedFilter) {
        var newValue = selectedFilter.isSelected ? null : selectedFilter.value;
        setSelectedItem(newValue);
    }, []);
    var resetChanges = (0, react_1.useCallback)(function () {
        setSelectedItem(null);
    }, []);
    var applyChanges = (0, react_1.useCallback)(function () {
        var _a;
        (0, Search_1.updateAdvancedFilters)((_a = {}, _a[booleanKey] = selectedItem, _a));
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    }, [booleanKey, selectedItem]);
    return (<ScreenWrapper_1.default testID={SearchBooleanFilterBase.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate(titleKey)} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SelectionList_1.default shouldSingleExecuteRowSelect sections={[{ data: items }]} ListItem={SingleSelectListItem_1.default} onSelectRow={updateFilter}/>
            </react_native_1.View>
            <FixedFooter_1.default style={styles.mtAuto}>
                <SearchFilterPageFooterButtons_1.default applyChanges={applyChanges} resetChanges={resetChanges}/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
SearchBooleanFilterBase.displayName = 'SearchBooleanFilterBase';
exports.default = SearchBooleanFilterBase;
