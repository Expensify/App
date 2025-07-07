"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OnyxProvider_1 = require("@components/OnyxProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ScheduleCall_1 = require("@libs/actions/ScheduleCall");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var UserUtils_1 = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ScheduleCallConfirmationPage() {
    var _a, _b, _c, _d, _e, _f;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var scheduleCallDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.SCHEDULE_CALL_DRAFT), { canBeMissing: false })[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var userTimezone = ((_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone) === null || _a === void 0 ? void 0 : _a.selected) ? currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone.selected : CONST_1.default.DEFAULT_TIME_ZONE.selected;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var route = (0, native_1.useRoute)();
    var confirm = (0, react_1.useCallback)(function () {
        if (!(scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.timeSlot) || !(scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.date) || !scheduleCallDraft.guide || !scheduleCallDraft.reportID) {
            return;
        }
        (0, ScheduleCall_1.confirmBooking)({
            date: scheduleCallDraft.date,
            timeSlot: scheduleCallDraft.timeSlot,
            guide: scheduleCallDraft.guide,
            reportID: scheduleCallDraft.reportID,
        }, currentUserPersonalDetails, userTimezone);
    }, [currentUserPersonalDetails, scheduleCallDraft, userTimezone]);
    var guideDetails = (0, react_1.useMemo)(function () {
        var _a, _b;
        return ((_a = scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.guide) === null || _a === void 0 ? void 0 : _a.accountID)
            ? ((_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[scheduleCallDraft.guide.accountID]) !== null && _b !== void 0 ? _b : {
                accountID: scheduleCallDraft.guide.accountID,
                login: scheduleCallDraft.guide.email,
                displayName: scheduleCallDraft.guide.email,
                avatar: (0, UserUtils_1.getDefaultAvatarURL)(scheduleCallDraft.guide.accountID),
            })
            : null;
    }, [personalDetails, (_b = scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.guide) === null || _b === void 0 ? void 0 : _b.accountID, (_c = scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.guide) === null || _c === void 0 ? void 0 : _c.email]);
    var dateTimeString = (0, react_1.useMemo)(function () {
        if (!(scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.timeSlot) || !scheduleCallDraft.date) {
            return '';
        }
        var dateString = (0, date_fns_1.format)(scheduleCallDraft.date, CONST_1.default.DATE.MONTH_DAY_YEAR_FORMAT);
        var timeString = "".concat(DateUtils_1.default.formatInTimeZoneWithFallback(scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.timeSlot, userTimezone, CONST_1.default.DATE.LOCAL_TIME_FORMAT), " - ").concat(DateUtils_1.default.formatInTimeZoneWithFallback((0, date_fns_1.addMinutes)(scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.timeSlot, 30), userTimezone, CONST_1.default.DATE.LOCAL_TIME_FORMAT));
        var timezoneString = DateUtils_1.default.getZoneAbbreviation(new Date(scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.timeSlot), userTimezone);
        return "".concat(dateString, " from ").concat(timeString, " ").concat(timezoneString);
    }, [scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.date, scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.timeSlot, userTimezone]);
    return (<ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} testID={ScheduleCallConfirmationPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('scheduledCall.confirmation.title')} onBackButtonPress={function () {
            var _a, _b;
            if (!((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.reportID)) {
                return;
            }
            Navigation_1.default.goBack(ROUTES_1.default.SCHEDULE_CALL_BOOK.getRoute((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.reportID));
        }}/>
            <FullPageOfflineBlockingView_1.default>
                <ScrollView_1.default contentContainerStyle={[styles.flexGrow1]}>
                    <Text_1.default style={[styles.mb5, styles.ph5, styles.colorMuted]}>{translate('scheduledCall.confirmation.description')}</Text_1.default>
                    <MenuItem_1.default style={styles.mb3} title={guideDetails === null || guideDetails === void 0 ? void 0 : guideDetails.displayName} description={guideDetails === null || guideDetails === void 0 ? void 0 : guideDetails.login} label={translate('scheduledCall.confirmation.setupSpecialist')} interactive={false} icon={[
            {
                id: guideDetails === null || guideDetails === void 0 ? void 0 : guideDetails.accountID,
                source: (_f = (_e = (_d = guideDetails === null || guideDetails === void 0 ? void 0 : guideDetails.avatarThumbnail) !== null && _d !== void 0 ? _d : guideDetails === null || guideDetails === void 0 ? void 0 : guideDetails.avatar) !== null && _e !== void 0 ? _e : guideDetails === null || guideDetails === void 0 ? void 0 : guideDetails.fallbackIcon) !== null && _f !== void 0 ? _f : Expensicons_1.FallbackAvatar,
                name: guideDetails === null || guideDetails === void 0 ? void 0 : guideDetails.login,
                type: CONST_1.default.ICON_TYPE_AVATAR,
            },
        ]}/>
                    <MenuItemWithTopDescription_1.default title={dateTimeString} description={translate('scheduledCall.confirmation.dateTime')} shouldTruncateTitle={false} numberOfLinesTitle={2} shouldShowRightIcon style={styles.mb3} onPress={function () {
            var _a, _b;
            if (!((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.reportID)) {
                return;
            }
            Navigation_1.default.goBack(ROUTES_1.default.SCHEDULE_CALL_BOOK.getRoute((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.reportID));
        }}/>
                    <MenuItemWithTopDescription_1.default title={translate('scheduledCall.confirmation.minutes')} description={translate('scheduledCall.confirmation.meetingLength')} interactive={false} style={styles.mb3}/>
                </ScrollView_1.default>
                <FixedFooter_1.default>
                    <Button_1.default success large text={translate('scheduledCall.confirmation.title')} onPress={confirm}/>
                </FixedFooter_1.default>
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
ScheduleCallConfirmationPage.displayName = 'ScheduleCallConfirmationPage';
exports.default = ScheduleCallConfirmationPage;
