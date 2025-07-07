"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWorkspaceList_1 = require("@hooks/useWorkspaceList");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var updateWorkspaceFilter = function (policyID) {
    (0, Search_1.updateAdvancedFilters)({
        policyID: policyID,
    });
    Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
};
function SearchFiltersWorkspacePage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM)[0];
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY), policies = _a[0], policiesResult = _a[1];
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; } })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP)[0];
    var _b = (0, useDebouncedState_1.default)(''), searchTerm = _b[0], debouncedSearchTerm = _b[1], setSearchTerm = _b[2];
    var shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    var _c = (0, useWorkspaceList_1.default)({
        policies: policies,
        currentUserLogin: currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyID: searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.policyID,
        searchTerm: debouncedSearchTerm,
    }), sections = _c.sections, shouldShowNoResultsFoundMessage = _c.shouldShowNoResultsFoundMessage, shouldShowSearchInput = _c.shouldShowSearchInput;
    return (<ScreenWrapper_1.default testID={SearchFiltersWorkspacePage.displayName} includeSafeAreaPaddingBottom shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            {function (_a) {
            var didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<>
                    <HeaderWithBackButton_1.default title={translate('workspace.common.workspace')} onBackButtonPress={function () {
                    Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
                }}/>
                    {shouldShowLoadingIndicator ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<SelectionList_1.default ListItem={UserListItem_1.default} sections={sections} onSelectRow={function (option) {
                        if (option.policyID === (searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.policyID) || !option.policyID) {
                            updateWorkspaceFilter(null);
                            return;
                        }
                        updateWorkspaceFilter(option.policyID);
                    }} textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined} textInputValue={searchTerm} onChangeText={setSearchTerm} headerMessage={shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : ''} initiallyFocusedOptionKey={searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.policyID} showLoadingPlaceholder={(0, isLoadingOnyxValue_1.default)(policiesResult) || !didScreenTransitionEnd}/>)}
                </>);
        }}
        </ScreenWrapper_1.default>);
}
SearchFiltersWorkspacePage.displayName = 'SearchFiltersWorkspacePage';
exports.default = SearchFiltersWorkspacePage;
