"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var CalendarPicker_1 = require("@components/DatePicker/CalendarPicker");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ScheduleCall_1 = require("@libs/actions/ScheduleCall");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AvailableBookingDay_1 = require("./AvailableBookingDay");
function ScheduleCallPage() {
    var _a, _b, _c, _d, _e, _f;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var userTimezone = ((_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone) === null || _a === void 0 ? void 0 : _a.selected) ? currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone.selected : CONST_1.default.DEFAULT_TIME_ZONE.selected;
    var scheduleCallDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.SCHEDULE_CALL_DRAFT), { canBeMissing: true })[0];
    var reportID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.reportID;
    var adminReportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID), {
        selector: function (data) { return ({
            calendlySchedule: data === null || data === void 0 ? void 0 : data.calendlySchedule,
        }); },
        canBeMissing: true,
    })[0];
    var calendlySchedule = adminReportNameValuePairs === null || adminReportNameValuePairs === void 0 ? void 0 : adminReportNameValuePairs.calendlySchedule;
    (0, react_1.useEffect)(function () {
        if (!reportID) {
            return;
        }
        (0, ScheduleCall_1.getGuideCallAvailabilitySchedule)(reportID);
    }, [reportID]);
    // Clear selected time when user comes back to the selection screen
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        (0, ScheduleCall_1.saveBookingDraft)({ timeSlot: null });
    }, []));
    var loadTimeSlotsAndSaveDate = (0, react_1.useCallback)(function (date) {
        (0, ScheduleCall_1.saveBookingDraft)({ date: date });
    }, []);
    var timeSlotDateMap = (0, react_1.useMemo)(function () {
        if (!(calendlySchedule === null || calendlySchedule === void 0 ? void 0 : calendlySchedule.data)) {
            return {};
        }
        var guides = Object.keys(calendlySchedule.data);
        var allTimeSlots = guides.reduce(function (allSlots, guideAccountID) {
            var _a;
            var guideSchedule = (_a = calendlySchedule === null || calendlySchedule === void 0 ? void 0 : calendlySchedule.data) === null || _a === void 0 ? void 0 : _a[guideAccountID];
            guideSchedule === null || guideSchedule === void 0 ? void 0 : guideSchedule.timeSlots.forEach(function (timeSlot) {
                allSlots.push({
                    guideAccountID: Number(guideAccountID),
                    guideEmail: guideSchedule.guideEmail,
                    startTime: timeSlot.startTime,
                    scheduleURL: timeSlot.schedulingURL,
                });
            });
            return allSlots;
        }, []);
        // Group time slots by date to render per day slots on calendar
        var timeSlotMap = {};
        allTimeSlots.forEach(function (timeSlot) {
            var timeSlotDate = DateUtils_1.default.formatInTimeZoneWithFallback(new Date(timeSlot === null || timeSlot === void 0 ? void 0 : timeSlot.startTime), userTimezone, CONST_1.default.DATE.FNS_FORMAT_STRING);
            if (!timeSlotMap[timeSlotDate]) {
                timeSlotMap[timeSlotDate] = [];
            }
            timeSlotMap[timeSlotDate].push(timeSlot);
        });
        // Sort time slots within each date array to have in chronological order
        Object.values(timeSlotMap).forEach(function (slots) {
            slots.sort(function (a, b) { return new Date(a.startTime).getTime() - new Date(b.startTime).getTime(); });
        });
        return timeSlotMap;
    }, [calendlySchedule === null || calendlySchedule === void 0 ? void 0 : calendlySchedule.data, userTimezone]);
    var selectableDates = Object.keys(timeSlotDateMap).sort(date_fns_1.compareAsc);
    var firstDate = selectableDates.at(0);
    var lastDate = selectableDates.at(selectableDates.length - 1);
    var minDate = firstDate ? (0, date_fns_1.parse)(firstDate, CONST_1.default.DATE.FNS_FORMAT_STRING, new Date()) : undefined;
    var maxDate = lastDate ? (0, date_fns_1.parse)(lastDate, CONST_1.default.DATE.FNS_FORMAT_STRING, new Date()) : undefined;
    var timeSlotsForSelectedData = (scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.date) ? ((_c = timeSlotDateMap === null || timeSlotDateMap === void 0 ? void 0 : timeSlotDateMap[scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.date]) !== null && _c !== void 0 ? _c : []) : [];
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((calendlySchedule === null || calendlySchedule === void 0 ? void 0 : calendlySchedule.isLoading) || !firstDate || (scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.date)) {
            return;
        }
        (0, ScheduleCall_1.saveBookingDraft)({ date: firstDate });
    }, [firstDate, calendlySchedule === null || calendlySchedule === void 0 ? void 0 : calendlySchedule.isLoading, scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.date]);
    // When there is only one time slot on the row, it will take full width of the row, use a hidden filler item to keep 2 columns
    var timeFillerItem = (0, react_1.useMemo)(function () {
        if (timeSlotsForSelectedData.length % 2 === 0) {
            return null;
        }
        return (<react_native_1.View key="time-filler-col" aria-hidden accessibilityElementsHidden style={[styles.twoColumnLayoutCol, styles.visibilityHidden]}/>);
    }, [styles.twoColumnLayoutCol, styles.visibilityHidden, timeSlotsForSelectedData.length]);
    return (<ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} testID={ScheduleCallPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('scheduledCall.book.title')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <FullPageOfflineBlockingView_1.default>
                {((_d = adminReportNameValuePairs === null || adminReportNameValuePairs === void 0 ? void 0 : adminReportNameValuePairs.calendlySchedule) === null || _d === void 0 ? void 0 : _d.isLoading) ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<ScrollView_1.default style={styles.flexGrow1}>
                        <react_native_1.View style={styles.ph5}>
                            <Text_1.default style={[styles.mb5, styles.colorMuted]}>{translate('scheduledCall.book.description')}</Text_1.default>
                            <react_native_1.View style={[styles.datePickerPopover, styles.border]} collapsable={false}>
                                <CalendarPicker_1.default value={scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.date} minDate={minDate} maxDate={maxDate} selectableDates={Object.keys(timeSlotDateMap)} DayComponent={AvailableBookingDay_1.default} onSelected={loadTimeSlotsAndSaveDate}/>
                            </react_native_1.View>
                        </react_native_1.View>
                        <MenuItemWithTopDescription_1.default interactive={false} title={userTimezone} description={translate('timezonePage.timezone')} style={[styles.mt3, styles.mb3]}/>
                        {!(0, EmptyObject_1.isEmptyObject)((_e = adminReportNameValuePairs === null || adminReportNameValuePairs === void 0 ? void 0 : adminReportNameValuePairs.calendlySchedule) === null || _e === void 0 ? void 0 : _e.errors) && (<DotIndicatorMessage_1.default type="error" style={[styles.ph5, styles.mt6, styles.flex0]} messages={(0, ErrorUtils_1.getLatestError)((_f = adminReportNameValuePairs === null || adminReportNameValuePairs === void 0 ? void 0 : adminReportNameValuePairs.calendlySchedule) === null || _f === void 0 ? void 0 : _f.errors)}/>)}
                        {!!(scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.date) && (<react_native_1.View style={[styles.ph5, styles.mb5]}>
                                <Text_1.default style={[styles.mb5, styles.colorMuted]}>
                                    {translate('scheduledCall.book.slots')}
                                    <Text_1.default style={[styles.textStrong, styles.colorMuted]}>{(0, date_fns_1.format)(scheduleCallDraft.date, CONST_1.default.DATE.MONTH_DAY_YEAR_FORMAT)}</Text_1.default>
                                </Text_1.default>
                                <react_native_1.View style={[styles.flexRow, styles.flexWrap, styles.justifyContentStart, styles.gap2]}>
                                    {timeSlotsForSelectedData.map(function (timeSlot) { return (<Button_1.default key={"time-slot-".concat(timeSlot.startTime)} large success={(scheduleCallDraft === null || scheduleCallDraft === void 0 ? void 0 : scheduleCallDraft.timeSlot) === timeSlot.startTime} onPress={function () {
                        (0, ScheduleCall_1.saveBookingDraft)({
                            timeSlot: timeSlot.startTime,
                            guide: {
                                scheduleURL: timeSlot.scheduleURL,
                                accountID: timeSlot.guideAccountID,
                                email: timeSlot.guideEmail,
                            },
                            reportID: reportID,
                        });
                        Navigation_1.default.navigate(ROUTES_1.default.SCHEDULE_CALL_CONFIRMATION.getRoute(reportID));
                    }} shouldEnableHapticFeedback style={styles.twoColumnLayoutCol} text={DateUtils_1.default.formatInTimeZoneWithFallback(timeSlot.startTime, userTimezone, CONST_1.default.DATE.LOCAL_TIME_FORMAT)}/>); })}
                                    {timeFillerItem}
                                </react_native_1.View>
                            </react_native_1.View>)}
                    </ScrollView_1.default>)}
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
ScheduleCallPage.displayName = 'ScheduleCallPage';
exports.default = ScheduleCallPage;
