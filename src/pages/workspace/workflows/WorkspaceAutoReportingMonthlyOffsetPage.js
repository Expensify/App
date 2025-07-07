"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var DAYS_OF_MONTH = 28;
function WorkspaceAutoReportingMonthlyOffsetPage(_a) {
    var _b;
    var policy = _a.policy, route = _a.route;
    var _c = (0, useLocalize_1.default)(), translate = _c.translate, toLocaleOrdinal = _c.toLocaleOrdinal;
    var offset = (_b = policy === null || policy === void 0 ? void 0 : policy.autoReportingOffset) !== null && _b !== void 0 ? _b : 0;
    var _d = (0, react_1.useState)(''), searchText = _d[0], setSearchText = _d[1];
    var trimmedText = searchText.trim().toLowerCase();
    var daysOfMonth = Array.from({ length: DAYS_OF_MONTH }, function (value, index) {
        var day = index + 1;
        return {
            text: toLocaleOrdinal(day),
            keyForList: day.toString(), // we have to cast it as string for <ListItem> to work
            isSelected: day === offset,
            isNumber: true,
        };
    }).concat([
        {
            keyForList: 'lastDayOfMonth',
            text: translate('workflowsPage.frequencies.lastDayOfMonth'),
            isSelected: offset === CONST_1.default.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH,
            isNumber: false,
        },
        {
            keyForList: 'lastBusinessDayOfMonth',
            text: translate('workflowsPage.frequencies.lastBusinessDayOfMonth'),
            isSelected: offset === CONST_1.default.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH,
            isNumber: false,
        },
    ]);
    var filteredDaysOfMonth = daysOfMonth.filter(function (dayItem) { return dayItem.text.toLowerCase().includes(trimmedText); });
    var headerMessage = searchText.trim() && !filteredDaysOfMonth.length ? translate('common.noResultsFound') : '';
    var onSelectDayOfMonth = function (item) {
        var _a, _b;
        Policy.setWorkspaceAutoReportingMonthlyOffset((_a = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _a !== void 0 ? _a : '-1', item.isNumber ? parseInt(item.keyForList, 10) : item.keyForList);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute((_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : ''));
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceAutoReportingMonthlyOffsetPage.displayName}>
                <FullPageNotFoundView_1.default onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy} onLinkPress={PolicyUtils.goBackFromInvalidPolicy} shouldShow={(0, EmptyObject_1.isEmptyObject)(policy) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy) || !PolicyUtils.isPaidGroupPolicy(policy)} subtitleKey={(0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized'} addBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={translate('workflowsPage.submissionFrequency')} onBackButtonPress={function () { var _a; return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute((_a = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _a !== void 0 ? _a : '')); }}/>

                    <SelectionList_1.default sections={[{ data: filteredDaysOfMonth }]} textInputLabel={translate('workflowsPage.submissionFrequencyDateOfMonth')} textInputValue={searchText} onChangeText={setSearchText} headerMessage={headerMessage} ListItem={RadioListItem_1.default} onSelectRow={onSelectDayOfMonth} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={offset.toString()} showScrollIndicator addBottomSafeAreaPadding/>
                </FullPageNotFoundView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceAutoReportingMonthlyOffsetPage.displayName = 'WorkspaceAutoReportingMonthlyOffsetPage';
exports.default = (0, withPolicy_1.default)(WorkspaceAutoReportingMonthlyOffsetPage);
