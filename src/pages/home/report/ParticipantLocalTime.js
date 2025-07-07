"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var Timers_1 = require("@libs/Timers");
var CONST_1 = require("@src/CONST");
function getParticipantLocalTime(participant, getLocalDateFromDatetime) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    var reportRecipientTimezone = participant.timezone || CONST_1.default.DEFAULT_TIME_ZONE;
    var reportTimezone = getLocalDateFromDatetime(undefined, reportRecipientTimezone.selected);
    var currentTimezone = getLocalDateFromDatetime();
    var reportRecipientDay = DateUtils_1.default.formatToDayOfWeek(reportTimezone);
    var currentUserDay = DateUtils_1.default.formatToDayOfWeek(currentTimezone);
    if (reportRecipientDay !== currentUserDay) {
        return "".concat(DateUtils_1.default.formatToLocalTime(reportTimezone), " ").concat(reportRecipientDay);
    }
    return "".concat(DateUtils_1.default.formatToLocalTime(reportTimezone));
}
function ParticipantLocalTime(_a) {
    var participant = _a.participant;
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, getLocalDateFromDatetime = _b.getLocalDateFromDatetime;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(function () { return getParticipantLocalTime(participant, getLocalDateFromDatetime); }), localTime = _c[0], setLocalTime = _c[1];
    (0, react_1.useEffect)(function () {
        var timer = Timers_1.default.register(setInterval(function () {
            setLocalTime(getParticipantLocalTime(participant, getLocalDateFromDatetime));
        }, 1000));
        return function () {
            clearInterval(timer);
        };
    }, [participant, getLocalDateFromDatetime]);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    var reportRecipientDisplayName = participant.firstName || participant.displayName;
    if (!reportRecipientDisplayName) {
        return null;
    }
    return (<react_native_1.View style={[styles.chatItemComposeSecondaryRow]}>
            <Text_1.default style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset, styles.pre]} numberOfLines={1}>
                {translate('reportActionCompose.localTime', {
            user: reportRecipientDisplayName,
            time: localTime,
        })}
            </Text_1.default>
        </react_native_1.View>);
}
ParticipantLocalTime.displayName = 'ParticipantLocalTime';
exports.default = ParticipantLocalTime;
