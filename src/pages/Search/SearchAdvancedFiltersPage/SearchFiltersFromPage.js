"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchFiltersParticipantsSelector_1 = require("@components/Search/SearchFiltersParticipantsSelector");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchActions = require("@userActions/Search");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersFromPage() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM)[0];
    return (<ScreenWrapper_1.default testID={SearchFiltersFromPage.displayName} includeSafeAreaPaddingBottom shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('common.from')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SearchFiltersParticipantsSelector_1.default initialAccountIDs={(_a = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.from) !== null && _a !== void 0 ? _a : []} onFiltersUpdate={function (selectedAccountIDs) {
            SearchActions.updateAdvancedFilters({
                from: selectedAccountIDs,
            });
        }}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SearchFiltersFromPage.displayName = 'SearchFiltersFromPage';
exports.default = SearchFiltersFromPage;
