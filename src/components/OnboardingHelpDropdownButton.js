"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var noop_1 = require("lodash/noop");
var react_1 = require("react");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var ScheduleCall_1 = require("@libs/actions/ScheduleCall");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ButtonWithDropdownMenu_1 = require("./ButtonWithDropdownMenu");
var Expensicons_1 = require("./Icon/Expensicons");
var Illustrations = require("./Icon/Illustrations");
function OnboardingHelpDropdownButton(_a) {
    var _b;
    var reportID = _a.reportID, shouldUseNarrowLayout = _a.shouldUseNarrowLayout, shouldShowRegisterForWebinar = _a.shouldShowRegisterForWebinar, shouldShowGuideBooking = _a.shouldShowGuideBooking, hasActiveScheduledCall = _a.hasActiveScheduledCall;
    var translate = (0, useLocalize_1.default)().translate;
    var accountID = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.accountID; }, canBeMissing: false })[0];
    var latestScheduledCall = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID), {
        selector: function (reportNameValuePairs) { var _a; return (_a = reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.calendlyCalls) === null || _a === void 0 ? void 0 : _a.at(-1); },
        canBeMissing: true,
    })[0];
    var styles = (0, useThemeStyles_1.default)();
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var userTimezone = ((_b = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone) === null || _b === void 0 ? void 0 : _b.selected) ? currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone.selected : CONST_1.default.DEFAULT_TIME_ZONE.selected;
    if (!reportID || !accountID) {
        return null;
    }
    var options = [];
    if (!hasActiveScheduledCall && shouldShowGuideBooking) {
        options.push({
            text: translate('getAssistancePage.scheduleACall'),
            icon: Expensicons_1.CalendarSolid,
            value: CONST_1.default.ONBOARDING_HELP.SCHEDULE_CALL,
            onSelected: function () {
                (0, ScheduleCall_1.clearBookingDraft)();
                Navigation_1.default.navigate(ROUTES_1.default.SCHEDULE_CALL_BOOK.getRoute(reportID));
            },
        });
    }
    if (hasActiveScheduledCall && latestScheduledCall) {
        options.push({
            text: "".concat(DateUtils_1.default.formatInTimeZoneWithFallback(latestScheduledCall.eventTime, userTimezone, CONST_1.default.DATE.WEEKDAY_TIME_FORMAT), ", ").concat(DateUtils_1.default.formatInTimeZoneWithFallback(latestScheduledCall.eventTime, userTimezone, CONST_1.default.DATE.MONTH_DAY_YEAR_FORMAT)),
            value: CONST_1.default.ONBOARDING_HELP.EVENT_TIME,
            description: "".concat(DateUtils_1.default.formatInTimeZoneWithFallback(latestScheduledCall.eventTime, userTimezone, CONST_1.default.DATE.LOCAL_TIME_FORMAT), " - ").concat(DateUtils_1.default.formatInTimeZoneWithFallback((0, date_fns_1.addMinutes)(latestScheduledCall.eventTime, 30), userTimezone, CONST_1.default.DATE.LOCAL_TIME_FORMAT), " ").concat(DateUtils_1.default.getZoneAbbreviation(new Date(latestScheduledCall.eventTime), userTimezone)),
            descriptionTextStyle: [styles.themeTextColor, styles.ml2],
            displayInDefaultIconColor: true,
            icon: Illustrations.HeadSet,
            iconWidth: variables_1.default.avatarSizeLargeNormal,
            iconHeight: variables_1.default.avatarSizeLargeNormal,
            wrapperStyle: [styles.mb3, styles.pl4, styles.pr5, styles.pt3, styles.pb6, styles.borderBottom],
            interactive: false,
            titleStyle: styles.ml2,
            avatarSize: CONST_1.default.AVATAR_SIZE.LARGE_NORMAL,
        });
        options.push({
            text: translate('common.reschedule'),
            value: CONST_1.default.ONBOARDING_HELP.RESCHEDULE,
            onSelected: function () { return (0, ScheduleCall_1.rescheduleBooking)(latestScheduledCall); },
            icon: Expensicons_1.CalendarSolid,
        });
        options.push({
            text: translate('common.cancel'),
            value: CONST_1.default.ONBOARDING_HELP.CANCEL,
            onSelected: function () { return (0, ScheduleCall_1.cancelBooking)(latestScheduledCall); },
            icon: Expensicons_1.Close,
        });
    }
    if (shouldShowRegisterForWebinar) {
        options.push({
            text: translate('getAssistancePage.registerForWebinar'),
            icon: Expensicons_1.Monitor,
            value: CONST_1.default.ONBOARDING_HELP.REGISTER_FOR_WEBINAR,
            onSelected: function () {
                (0, Link_1.openExternalLink)(CONST_1.default.REGISTER_FOR_WEBINAR_URL);
            },
        });
    }
    if (options.length === 0) {
        return null;
    }
    return (<ButtonWithDropdownMenu_1.default onPress={noop_1.default} shouldAlwaysShowDropdownMenu pressOnEnter success={!!hasActiveScheduledCall} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} options={options} isSplitButton={false} customText={hasActiveScheduledCall ? translate('scheduledCall.callScheduled') : translate('getAssistancePage.onboardingHelp')} wrapperStyle={shouldUseNarrowLayout && styles.earlyDiscountButton}/>);
}
exports.default = OnboardingHelpDropdownButton;
