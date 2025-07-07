"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var PressableWithSecondaryInteraction_1 = require("@components/PressableWithSecondaryInteraction");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var Timing_1 = require("@libs/actions/Timing");
var Performance_1 = require("@libs/Performance");
var CONST_1 = require("@src/CONST");
function ReportActionItemThread(_a) {
    var _b, _c;
    var numberOfReplies = _a.numberOfReplies, icons = _a.icons, mostRecentReply = _a.mostRecentReply, reportID = _a.reportID, reportAction = _a.reportAction, isHovered = _a.isHovered, onSecondaryInteraction = _a.onSecondaryInteraction, isActive = _a.isActive;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, useLocalize_1.default)(), translate = _d.translate, datetimeToCalendarTime = _d.datetimeToCalendarTime;
    var numberOfRepliesText = numberOfReplies > CONST_1.default.MAX_THREAD_REPLIES_PREVIEW ? "".concat(CONST_1.default.MAX_THREAD_REPLIES_PREVIEW, "+") : "".concat(numberOfReplies);
    var replyText = numberOfReplies === 1 ? translate('threads.reply') : translate('threads.replies');
    var timeStamp = datetimeToCalendarTime(mostRecentReply, false);
    return (<react_native_1.View style={[styles.chatItemMessage]}>
            <PressableWithSecondaryInteraction_1.default onPress={function () {
            Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_REPORT_THREAD);
            Timing_1.default.start(CONST_1.default.TIMING.OPEN_REPORT_THREAD);
            (0, Report_1.navigateToAndOpenChildReport)(reportAction.childReportID, reportAction, reportID);
        }} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={"".concat(numberOfReplies, " ").concat(replyText)} onSecondaryInteraction={onSecondaryInteraction}>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                    <MultipleAvatars_1.default size={CONST_1.default.AVATAR_SIZE.SMALL} icons={icons} shouldStackHorizontally isHovered={isHovered} isActive={isActive} isInReportAction/>
                    <react_native_1.View style={[styles.flex1, styles.flexRow, styles.lh140Percent, styles.alignItemsEnd]}>
                        <Text_1.default style={[styles.link, styles.ml2, styles.h4, styles.noWrap, styles.userSelectNone]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                            {"".concat(numberOfRepliesText, " ").concat(replyText)}
                        </Text_1.default>
                        <Text_1.default numberOfLines={1} style={[styles.ml2, styles.textMicroSupporting, styles.flex1, styles.userSelectNone]} dataSet={_c = {}, _c[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _c}>
                            {timeStamp}
                        </Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
            </PressableWithSecondaryInteraction_1.default>
        </react_native_1.View>);
}
ReportActionItemThread.displayName = 'ReportActionItemThread';
exports.default = ReportActionItemThread;
