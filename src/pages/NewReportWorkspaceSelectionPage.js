"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function NewReportWorkspaceSelectionPage() {
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, useDebouncedState_1.default)(''), searchTerm = _a[0], debouncedSearchTerm = _a[1], setSearchTerm = _a[2];
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true }), policies = _b[0], fetchStatus = _b[1];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: true })[0];
    var shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    var navigateToNewReport = (0, react_1.useCallback)(function (optimisticReportID) {
        if (shouldUseNarrowLayout) {
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
                Navigation_1.default.navigate(ROUTES_1.default.SEARCH_MONEY_REQUEST_REPORT.getRoute({ reportID: optimisticReportID }), { forceReplace: true });
            });
            return;
        }
        // On wide screens we use dismissModal instead of forceReplace to avoid performance issues
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
            Navigation_1.default.dismissModal();
        });
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_MONEY_REQUEST_REPORT.getRoute({ reportID: optimisticReportID }));
        });
    }, [shouldUseNarrowLayout]);
    var selectPolicy = (0, react_1.useCallback)(function (policyID) {
        if (!policyID) {
            return;
        }
        if ((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyID)) {
            Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policyID));
            return;
        }
        var optimisticReportID = (0, Report_1.createNewReport)(currentUserPersonalDetails, policyID);
        navigateToNewReport(optimisticReportID);
    }, [currentUserPersonalDetails, navigateToNewReport]);
    var usersWorkspaces = (0, react_1.useMemo)(function () {
        if (!policies || (0, EmptyObject_1.isEmptyObject)(policies)) {
            return [];
        }
        return Object.values(policies)
            .filter(function (policy) { return (0, PolicyUtils_1.shouldShowPolicy)(policy, !!isOffline, currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login) && !(policy === null || policy === void 0 ? void 0 : policy.isJoinRequestPending) && (policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled); })
            .map(function (policy) {
            var _a;
            return ({
                text: (_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : '',
                policyID: policy === null || policy === void 0 ? void 0 : policy.id,
                icons: [
                    {
                        source: (policy === null || policy === void 0 ? void 0 : policy.avatarURL) ? policy.avatarURL : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy === null || policy === void 0 ? void 0 : policy.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy === null || policy === void 0 ? void 0 : policy.name,
                        type: CONST_1.default.ICON_TYPE_WORKSPACE,
                        id: policy === null || policy === void 0 ? void 0 : policy.id,
                    },
                ],
                keyForList: policy === null || policy === void 0 ? void 0 : policy.id,
                isPolicyAdmin: (0, PolicyUtils_1.isPolicyAdmin)(policy),
                shouldSyncFocus: true,
            });
        })
            .sort(function (a, b) { return a.text.localeCompare(b.text.toLowerCase()); });
    }, [policies, isOffline, currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login]);
    var filteredAndSortedUserWorkspaces = (0, react_1.useMemo)(function () { return usersWorkspaces.filter(function (policy) { var _a, _b; return (_a = policy.text) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes((_b = debouncedSearchTerm === null || debouncedSearchTerm === void 0 ? void 0 : debouncedSearchTerm.toLowerCase()) !== null && _b !== void 0 ? _b : ''); }); }, [debouncedSearchTerm, usersWorkspaces]);
    var sections = (0, react_1.useMemo)(function () {
        var options = [
            {
                data: filteredAndSortedUserWorkspaces,
                shouldShow: true,
            },
        ];
        return options;
    }, [filteredAndSortedUserWorkspaces]);
    var areResultsFound = filteredAndSortedUserWorkspaces.length > 0;
    var headerMessage = (0, OptionsListUtils_1.getHeaderMessageForNonUserList)(areResultsFound, debouncedSearchTerm);
    return (<ScreenWrapper_1.default testID={NewReportWorkspaceSelectionPage.displayName} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            {function (_a) {
            var didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<>
                    <HeaderWithBackButton_1.default title={translate('report.newReport.createReport')} onBackButtonPress={Navigation_1.default.goBack}/>
                    {shouldShowLoadingIndicator ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<>
                            <Text_1.default style={[styles.ph5, styles.mb3]}>{translate('report.newReport.chooseWorkspace')}</Text_1.default>
                            <SelectionList_1.default ListItem={UserListItem_1.default} sections={sections} onSelectRow={function (option) { return selectPolicy(option.policyID); }} textInputLabel={usersWorkspaces.length >= CONST_1.default.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined} textInputValue={searchTerm} onChangeText={setSearchTerm} headerMessage={headerMessage} showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}/>
                        </>)}
                </>);
        }}
        </ScreenWrapper_1.default>);
}
NewReportWorkspaceSelectionPage.displayName = 'NewReportWorkspaceSelectionPage';
exports.default = NewReportWorkspaceSelectionPage;
