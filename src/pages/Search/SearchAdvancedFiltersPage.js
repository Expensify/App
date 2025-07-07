"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AdvancedSearchFilters_1 = require("./AdvancedSearchFilters");
function SearchAdvancedFiltersPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var emptySearchFilters = {};
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true })[0], searchAdvancedFilters = _a === void 0 ? emptySearchFilters : _a;
    var shouldShowResetFilters = Object.entries(searchAdvancedFilters)
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        if (key === CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY) {
            return false;
        }
        if (key === CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.TYPE) {
            return value !== CONST_1.default.SEARCH.DATA_TYPES.EXPENSE;
        }
        if (key === CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.STATUS) {
            return value !== CONST_1.default.SEARCH.STATUS.EXPENSE.ALL;
        }
        return true;
    })
        .some(function (_a) {
        var value = _a[1];
        return (Array.isArray(value) ? value.length !== 0 : !!value);
    });
    return (<ScreenWrapper_1.default testID={SearchAdvancedFiltersPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} includeSafeAreaPaddingBottom>
            <HeaderWithBackButton_1.default title={translate('search.filtersHeader')}>
                {shouldShowResetFilters && <TextLink_1.default onPress={Search_1.clearAdvancedFilters}>{translate('search.resetFilters')}</TextLink_1.default>}
            </HeaderWithBackButton_1.default>
            <AdvancedSearchFilters_1.default />
        </ScreenWrapper_1.default>);
}
SearchAdvancedFiltersPage.displayName = 'SearchAdvancedFiltersPage';
exports.default = SearchAdvancedFiltersPage;
