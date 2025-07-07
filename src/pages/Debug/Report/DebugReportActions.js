"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var ScrollView_1 = require("@components/ScrollView");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Parser_1 = require("@libs/Parser");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SidebarUtils_1 = require("@libs/SidebarUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function DebugReportActions(_a) {
    var reportID = _a.reportID;
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, datetimeToCalendarTime = _b.datetimeToCalendarTime;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, useDebouncedState_1.default)(''), searchValue = _c[0], debouncedSearchValue = _c[1], setSearchValue = _c[2];
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: true })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    var isReportArchived = (0, useReportIsArchived_1.default)(reportID);
    var ifUserCanPerformWriteAction = (0, ReportUtils_1.canUserPerformWriteAction)(report);
    var sortedAllReportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), {
        canEvict: false,
        selector: function (allReportActions) { return (0, ReportActionsUtils_1.getSortedReportActionsForDisplay)(allReportActions, ifUserCanPerformWriteAction, true); },
        canBeMissing: true,
    })[0];
    var getReportActionDebugText = (0, react_1.useCallback)(function (reportAction) {
        var _a;
        var reportActionMessage = (0, ReportActionsUtils_1.getReportActionMessage)(reportAction);
        var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
        if (!reportActionMessage) {
            return '';
        }
        if (!!reportActionMessage.deleted || (originalMessage && 'deleted' in originalMessage && originalMessage.deleted)) {
            return "[".concat(translate('parentReportAction.deletedMessage'), "]");
        }
        if ((0, ReportActionsUtils_1.isCreatedAction)(reportAction)) {
            return (0, ReportUtils_1.formatReportLastMessageText)((_a = SidebarUtils_1.default.getWelcomeMessage(report, policy, isReportArchived).messageText) !== null && _a !== void 0 ? _a : translate('report.noActivityYet'));
        }
        if (reportActionMessage.html) {
            return Parser_1.default.htmlToText(reportActionMessage.html.replace(/<mention-user accountID=(\d+)>\s*<\/mention-user>/gi, '<mention-user accountID="$1"/>'));
        }
        return (0, ReportActionsUtils_1.getReportActionMessageText)(reportAction);
    }, [translate, policy, report, isReportArchived]);
    var searchedReportActions = (0, react_1.useMemo)(function () {
        return (sortedAllReportActions !== null && sortedAllReportActions !== void 0 ? sortedAllReportActions : [])
            .filter(function (reportAction) {
            return reportAction.reportActionID.includes(debouncedSearchValue) || (0, ReportActionsUtils_1.getReportActionMessageText)(reportAction).toLowerCase().includes(debouncedSearchValue.toLowerCase());
        })
            .map(function (reportAction) { return ({
            reportActionID: reportAction.reportActionID,
            text: getReportActionDebugText(reportAction),
            alternateText: "".concat(reportAction.reportActionID, " | ").concat(datetimeToCalendarTime(reportAction.created, false, false)),
        }); });
    }, [sortedAllReportActions, debouncedSearchValue, getReportActionDebugText, datetimeToCalendarTime]);
    return (<ScrollView_1.default style={styles.mv3}>
            <Button_1.default success large text={translate('common.create')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT_ACTION_CREATE.getRoute(reportID)); }} style={[styles.pb3, styles.ph3]}/>
            <SelectionList_1.default sections={[{ data: searchedReportActions }]} listItemTitleStyles={styles.fontWeightNormal} textInputValue={searchValue} textInputLabel={translate('common.search')} headerMessage={(0, OptionsListUtils_1.getHeaderMessageForNonUserList)(searchedReportActions.length > 0, debouncedSearchValue)} onChangeText={setSearchValue} onSelectRow={function (item) { return Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT_ACTION.getRoute(reportID, item.reportActionID)); }} ListItem={RadioListItem_1.default}/>
        </ScrollView_1.default>);
}
DebugReportActions.displayName = 'DebugReportActions';
exports.default = DebugReportActions;
