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
var Report_1 = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NotFoundPage_1 = require("./ErrorPage/NotFoundPage");
var withReportOrNotFound_1 = require("./home/report/withReportOrNotFound");
function ReportChangeWorkspacePage(_a) {
    var report = _a.report, route = _a.route;
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, useDebouncedState_1.default)(''), searchTerm = _b[0], debouncedSearchTerm = _b[1], setSearchTerm = _b[2];
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true }), policies = _c[0], fetchStatus = _c[1];
    var reportNextStep = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(reportID), { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: false })[0];
    var shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    var selectPolicy = (0, react_1.useCallback)(function (policyID) {
        var _a;
        if (!policyID) {
            return;
        }
        var backTo = route.params.backTo;
        Navigation_1.default.goBack(backTo);
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        if ((0, ReportUtils_1.isIOUReport)(reportID) && (0, PolicyUtils_1.isPolicyAdmin)((0, PolicyUtils_1.getPolicy)(policyID)) && report.ownerAccountID && !(0, PolicyUtils_1.isPolicyMember)((0, PersonalDetailsUtils_1.getLoginByAccountID)(report.ownerAccountID), policyID)) {
            (0, Report_1.moveIOUReportToPolicyAndInviteSubmitter)(reportID, policyID);
        }
        else if ((0, ReportUtils_1.isIOUReport)(reportID) && (0, PolicyUtils_1.isPolicyMember)(session === null || session === void 0 ? void 0 : session.email, policyID)) {
            (0, Report_1.moveIOUReportToPolicy)(reportID, policyID);
            // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
            // eslint-disable-next-line deprecation/deprecation
        }
        else if ((0, ReportUtils_1.isExpenseReport)(report) && (0, PolicyUtils_1.isPolicyAdmin)((0, PolicyUtils_1.getPolicy)(policyID)) && report.ownerAccountID && !(0, PolicyUtils_1.isPolicyMember)((0, PersonalDetailsUtils_1.getLoginByAccountID)(report.ownerAccountID), policyID)) {
            var employeeList = (_a = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _a === void 0 ? void 0 : _a.employeeList;
            (0, Report_1.changeReportPolicyAndInviteSubmitter)(report, policyID, employeeList);
        }
        else {
            (0, Report_1.changeReportPolicy)(report, policyID, reportNextStep);
        }
    }, [session === null || session === void 0 ? void 0 : session.email, route.params, report, reportID, reportNextStep, policies]);
    var _d = (0, useWorkspaceList_1.default)({
        policies: policies,
        currentUserLogin: session === null || session === void 0 ? void 0 : session.email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyID: report.policyID,
        searchTerm: debouncedSearchTerm,
        additionalFilter: function (newPolicy) { return (0, ReportUtils_1.isWorkspaceEligibleForReportChange)(newPolicy, report, policies); },
    }), sections = _d.sections, shouldShowNoResultsFoundMessage = _d.shouldShowNoResultsFoundMessage, shouldShowSearchInput = _d.shouldShowSearchInput;
    if (!(0, ReportUtils_1.isMoneyRequestReport)(report) || (0, ReportUtils_1.isMoneyRequestReportPendingDeletion)(report)) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default testID={ReportChangeWorkspacePage.displayName} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            {function (_a) {
            var didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<>
                    <HeaderWithBackButton_1.default title={translate('iou.changeWorkspace')} onBackButtonPress={function () {
                    var backTo = route.params.backTo;
                    Navigation_1.default.goBack(backTo);
                }}/>
                    {shouldShowLoadingIndicator ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<SelectionList_1.default ListItem={UserListItem_1.default} sections={sections} onSelectRow={function (option) { return selectPolicy(option.policyID); }} textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined} textInputValue={searchTerm} onChangeText={setSearchTerm} headerMessage={shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : ''} initiallyFocusedOptionKey={report.policyID} showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}/>)}
                </>);
        }}
        </ScreenWrapper_1.default>);
}
ReportChangeWorkspacePage.displayName = 'ReportChangeWorkspacePage';
exports.default = (0, withReportOrNotFound_1.default)()(ReportChangeWorkspacePage);
