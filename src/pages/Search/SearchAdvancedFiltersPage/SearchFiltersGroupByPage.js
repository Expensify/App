"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var SingleSelectListItem_1 = require("@components/SelectionList/SingleSelectListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersGroupByPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true })[0];
    var _a = (0, react_1.useState)(searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.groupBy), selectedItem = _a[0], setSelectedItem = _a[1];
    var listData = (0, react_1.useMemo)(function () {
        return (0, SearchUIUtils_1.getGroupByOptions)().map(function (groupOption) { return ({
            text: translate(groupOption.translation),
            keyForList: groupOption.value,
            isSelected: selectedItem === groupOption.value,
        }); });
    }, [selectedItem, translate]);
    var updateSelectedItem = (0, react_1.useCallback)(function (type) {
        var _a;
        setSelectedItem((_a = type === null || type === void 0 ? void 0 : type.keyForList) !== null && _a !== void 0 ? _a : undefined);
    }, []);
    var resetChanges = (0, react_1.useCallback)(function () {
        setSelectedItem(undefined);
    }, []);
    var applyChanges = (0, react_1.useCallback)(function () {
        (0, Search_1.updateAdvancedFilters)({ groupBy: selectedItem !== null && selectedItem !== void 0 ? selectedItem : null });
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    }, [selectedItem]);
    return (<ScreenWrapper_1.default testID={SearchFiltersGroupByPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('search.groupBy')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SelectionList_1.default shouldSingleExecuteRowSelect sections={[{ data: listData }]} ListItem={SingleSelectListItem_1.default} onSelectRow={updateSelectedItem}/>
            </react_native_1.View>
            <FixedFooter_1.default style={styles.mtAuto}>
                <Button_1.default large style={[styles.mt4]} text={translate('common.reset')} onPress={resetChanges}/>
                <Button_1.default large success pressOnEnter style={[styles.mt4]} text={translate('common.save')} onPress={applyChanges}/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
SearchFiltersGroupByPage.displayName = 'SearchFiltersGroupByPage';
exports.default = SearchFiltersGroupByPage;
