"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var withReportOrNotFound_1 = require("@pages/home/report/withReportOrNotFound");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ReportSettingsPage(_a) {
    var _b;
    var report = _a.report, policy = _a.policy, route = _a.route;
    var backTo = route.params.backTo;
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isReportArchived = (0, useReportIsArchived_1.default)(reportID);
    var isArchivedNonExpenseReport = (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived);
    // The workspace the report is on, null if the user isn't a member of the workspace
    var linkedWorkspace = (0, react_1.useMemo)(function () { return ((report === null || report === void 0 ? void 0 : report.policyID) && (policy === null || policy === void 0 ? void 0 : policy.id) === (report === null || report === void 0 ? void 0 : report.policyID) ? policy : undefined); }, [policy, report === null || report === void 0 ? void 0 : report.policyID]);
    var isMoneyRequestReport = (0, ReportUtils_1.isMoneyRequestReport)(report);
    var shouldDisableSettings = isArchivedNonExpenseReport || (0, EmptyObject_1.isEmptyObject)(report) || (0, ReportUtils_1.isSelfDM)(report);
    var notificationPreferenceValue = (0, ReportUtils_1.getReportNotificationPreference)(report);
    var notificationPreference = notificationPreferenceValue && !(0, ReportUtils_1.isHiddenForCurrentUser)(notificationPreferenceValue)
        ? translate("notificationPreferencesPage.notificationPreferences.".concat(notificationPreferenceValue))
        : '';
    var writeCapability = (0, ReportUtils_1.isAdminRoom)(report) ? CONST_1.default.REPORT.WRITE_CAPABILITIES.ADMINS : ((_b = report === null || report === void 0 ? void 0 : report.writeCapability) !== null && _b !== void 0 ? _b : CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL);
    var writeCapabilityText = translate("writeCapabilityPage.writeCapability.".concat(writeCapability));
    var shouldAllowWriteCapabilityEditing = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.canEditWriteCapability)(report, linkedWorkspace, isReportArchived); }, [report, linkedWorkspace, isReportArchived]);
    var shouldAllowChangeVisibility = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.canEditRoomVisibility)(linkedWorkspace, isArchivedNonExpenseReport); }, [linkedWorkspace, isArchivedNonExpenseReport]);
    var shouldShowNotificationPref = !isMoneyRequestReport && !(0, ReportUtils_1.isHiddenForCurrentUser)(notificationPreferenceValue);
    var shouldShowWriteCapability = !isMoneyRequestReport;
    return (<ScreenWrapper_1.default testID={ReportSettingsPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={shouldDisableSettings}>
                <HeaderWithBackButton_1.default title={translate('common.settings')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo)); }}/>
                <ScrollView_1.default style={[styles.flex1]}>
                    {shouldShowNotificationPref && (<MenuItemWithTopDescription_1.default shouldShowRightIcon title={notificationPreference} description={translate('notificationPreferencesPage.label')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.getRoute(reportID, backTo)); }}/>)}
                    {shouldShowWriteCapability &&
            (shouldAllowWriteCapabilityEditing ? (<MenuItemWithTopDescription_1.default shouldShowRightIcon title={writeCapabilityText} description={translate('writeCapabilityPage.label')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_SETTINGS_WRITE_CAPABILITY.getRoute(reportID, backTo)); }}/>) : (<react_native_1.View style={[styles.ph5, styles.pv3]}>
                                <Text_1.default style={[styles.textLabelSupporting, styles.lh16, styles.mb1]} numberOfLines={1}>
                                    {translate('writeCapabilityPage.label')}
                                </Text_1.default>
                                <Text_1.default numberOfLines={1} style={[styles.optionAlternateText, styles.pre]}>
                                    {writeCapabilityText}
                                </Text_1.default>
                            </react_native_1.View>))}
                    {!!(report === null || report === void 0 ? void 0 : report.visibility) &&
            report.chatType !== CONST_1.default.REPORT.CHAT_TYPE.INVOICE &&
            (shouldAllowChangeVisibility ? (<MenuItemWithTopDescription_1.default shouldShowRightIcon title={translate("newRoomPage.visibilityOptions.".concat(report.visibility))} description={translate('newRoomPage.visibility')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_SETTINGS_VISIBILITY.getRoute(report.reportID, backTo)); }}/>) : (<react_native_1.View style={[styles.pv3, styles.ph5]}>
                                <Text_1.default style={[styles.textLabelSupporting, styles.lh16, styles.mb1]} numberOfLines={1}>
                                    {translate('newRoomPage.visibility')}
                                </Text_1.default>
                                <Text_1.default numberOfLines={1} style={[styles.reportSettingsVisibilityText]}>
                                    {translate("newRoomPage.visibilityOptions.".concat(report.visibility))}
                                </Text_1.default>
                                <Text_1.default style={[styles.textLabelSupporting, styles.mt1]}>{translate("newRoomPage.".concat(report.visibility, "Description"))}</Text_1.default>
                            </react_native_1.View>))}
                </ScrollView_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
ReportSettingsPage.displayName = 'ReportSettingsPage';
exports.default = (0, withReportOrNotFound_1.default)()(ReportSettingsPage);
