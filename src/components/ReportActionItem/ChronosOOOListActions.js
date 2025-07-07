"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var Chronos_1 = require("@userActions/Chronos");
function ChronosOOOListActions(_a) {
    var _b, _c;
    var reportID = _a.reportID, action = _a.action;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, useLocalize_1.default)(), translate = _d.translate, getLocalDateFromDatetime = _d.getLocalDateFromDatetime;
    var events = (_c = (_b = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _b === void 0 ? void 0 : _b.events) !== null && _c !== void 0 ? _c : [];
    if (!events.length) {
        return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.ml18]}>
                <Text_1.default>You haven&apos;t created any events</Text_1.default>
            </react_native_1.View>);
    }
    return (<OfflineWithFeedback_1.default pendingAction={action.pendingAction}>
            <react_native_1.View style={styles.chatItemMessage}>
                {events.map(function (event) {
            var _a, _b, _c, _d;
            var start = getLocalDateFromDatetime((_b = (_a = event === null || event === void 0 ? void 0 : event.start) === null || _a === void 0 ? void 0 : _a.date) !== null && _b !== void 0 ? _b : '');
            var end = getLocalDateFromDatetime((_d = (_c = event === null || event === void 0 ? void 0 : event.end) === null || _c === void 0 ? void 0 : _c.date) !== null && _d !== void 0 ? _d : '');
            return (<react_native_1.View key={event.id} style={[styles.flexRow, styles.ml18, styles.pr4, styles.alignItemsCenter]}>
                            <Text_1.default style={styles.flexShrink1}>
                                {event.lengthInDays > 0
                    ? translate('chronos.oooEventSummaryFullDay', {
                        summary: event.summary,
                        dayCount: event.lengthInDays,
                        date: DateUtils_1.default.formatToLongDateWithWeekday(end),
                    })
                    : translate('chronos.oooEventSummaryPartialDay', {
                        summary: event.summary,
                        timePeriod: "".concat(DateUtils_1.default.formatToLocalTime(start), " - ").concat(DateUtils_1.default.formatToLocalTime(end)),
                        date: DateUtils_1.default.formatToLongDateWithWeekday(end),
                    })}
                            </Text_1.default>
                            <Button_1.default small style={styles.pl2} onPress={function () { return (0, Chronos_1.removeEvent)(reportID, action.reportActionID, event.id, events); }}>
                                <Text_1.default style={styles.buttonSmallText}>{translate('common.remove')}</Text_1.default>
                            </Button_1.default>
                        </react_native_1.View>);
        })}
            </react_native_1.View>
        </OfflineWithFeedback_1.default>);
}
ChronosOOOListActions.displayName = 'ChronosOOOListActions';
exports.default = ChronosOOOListActions;
