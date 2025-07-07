"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var ReportUtils_1 = require("@libs/ReportUtils");
var withReportOrNotFound_1 = require("@pages/home/report/withReportOrNotFound");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
function NotificationPreferencePage(_a) {
    var _b;
    var report = _a.report;
    var route = (0, native_1.useRoute)();
    var translate = (0, useLocalize_1.default)().translate;
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var isMoneyRequest = (0, ReportUtils_1.isMoneyRequestReport)(report);
    var currentNotificationPreference = (0, ReportUtils_1.getReportNotificationPreference)(report);
    var shouldDisableNotificationPreferences = (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived) || (0, ReportUtils_1.isSelfDM)(report) || (!isMoneyRequest && (0, ReportUtils_1.isHiddenForCurrentUser)(currentNotificationPreference));
    var notificationPreferenceOptions = Object.values(CONST_1.default.REPORT.NOTIFICATION_PREFERENCE)
        .filter(function (pref) { return !(0, ReportUtils_1.isHiddenForCurrentUser)(pref); })
        .map(function (preference) { return ({
        value: preference,
        text: translate("notificationPreferencesPage.notificationPreferences.".concat(preference)),
        keyForList: preference,
        isSelected: preference === currentNotificationPreference,
    }); });
    var goBack = (0, react_1.useCallback)(function () {
        (0, ReportUtils_1.goBackToDetailsPage)(report, route.params.backTo);
    }, [report, route.params.backTo]);
    var updateNotificationPreferenceForReportAction = (0, react_1.useCallback)(function (value) {
        (0, Report_1.updateNotificationPreference)(report.reportID, currentNotificationPreference, value, undefined, undefined);
        goBack();
    }, [report.reportID, currentNotificationPreference, goBack]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={NotificationPreferencePage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={shouldDisableNotificationPreferences}>
                <HeaderWithBackButton_1.default title={translate('notificationPreferencesPage.header')} onBackButtonPress={goBack}/>
                <SelectionList_1.default sections={[{ data: notificationPreferenceOptions }]} ListItem={RadioListItem_1.default} onSelectRow={function (option) { return updateNotificationPreferenceForReportAction(option.value); }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_b = notificationPreferenceOptions.find(function (locale) { return locale.isSelected; })) === null || _b === void 0 ? void 0 : _b.keyForList}/>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
NotificationPreferencePage.displayName = 'NotificationPreferencePage';
exports.default = (0, withReportOrNotFound_1.default)()(NotificationPreferencePage);
