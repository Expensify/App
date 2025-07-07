"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ReportActionItemDate(_a) {
    var created = _a.created;
    var datetimeToCalendarTime = (0, useLocalize_1.default)().datetimeToCalendarTime;
    var styles = (0, useThemeStyles_1.default)();
    // It is used to force re-render of component that display relative time, ensuring they update correctly when the date changes (e.g., at midnight).
    (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENT_DATE, { canBeMissing: true });
    return <Text_1.default style={[styles.chatItemMessageHeaderTimestamp]}>{datetimeToCalendarTime(created, false, false)}</Text_1.default>;
}
ReportActionItemDate.displayName = 'ReportActionItemDate';
exports.default = (0, react_1.memo)(ReportActionItemDate);
