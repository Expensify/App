"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Checkbox_1 = require("@components/Checkbox");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var OnyxProvider_1 = require("@components/OnyxProvider");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var RenderHTML_1 = require("@components/RenderHTML");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var UserDetailsTooltip_1 = require("@components/UserDetailsTooltip");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useParentReport_1 = require("@hooks/useParentReport");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
var Task_1 = require("@libs/actions/Task");
var ControlSelection_1 = require("@libs/ControlSelection");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var getButtonState_1 = require("@libs/getButtonState");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function TaskPreview(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var taskReport = _a.taskReport, action = _a.action, contextMenuAnchor = _a.contextMenuAnchor, chatReportID = _a.chatReportID, checkIfContextMenuActive = _a.checkIfContextMenuActive, currentUserPersonalDetails = _a.currentUserPersonalDetails, onShowContextMenu = _a.onShowContextMenu, _j = _a.isHovered, isHovered = _j === void 0 ? false : _j, style = _a.style, _k = _a.shouldDisplayContextMenu, shouldDisplayContextMenu = _k === void 0 ? true : _k;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var taskReportID = (_b = taskReport === null || taskReport === void 0 ? void 0 : taskReport.reportID) !== null && _b !== void 0 ? _b : action === null || action === void 0 ? void 0 : action.childReportID;
    var taskTitle = (_d = (_c = action === null || action === void 0 ? void 0 : action.childReportName) !== null && _c !== void 0 ? _c : taskReport === null || taskReport === void 0 ? void 0 : taskReport.reportName) !== null && _d !== void 0 ? _d : '';
    var taskTitleWithoutImage = Parser_1.default.replace(Parser_1.default.htmlToMarkdown(taskTitle), { disabledRules: __spreadArray([], CONST_1.default.TASK_TITLE_DISABLED_RULES, true) });
    // The reportAction might not contain details regarding the taskReport
    // Only the direct parent reportAction will contain details about the taskReport
    // Other linked reportActions will only contain the taskReportID and we will grab the details from there
    var isTaskCompleted = !(0, EmptyObject_1.isEmptyObject)(taskReport)
        ? (taskReport === null || taskReport === void 0 ? void 0 : taskReport.stateNum) === CONST_1.default.REPORT.STATE_NUM.APPROVED && taskReport.statusNum === CONST_1.default.REPORT.STATUS_NUM.APPROVED
        : (action === null || action === void 0 ? void 0 : action.childStateNum) === CONST_1.default.REPORT.STATE_NUM.APPROVED && (action === null || action === void 0 ? void 0 : action.childStatusNum) === CONST_1.default.REPORT.STATUS_NUM.APPROVED;
    var taskAssigneeAccountID = (_f = (_e = (0, Task_1.getTaskAssigneeAccountID)(taskReport)) !== null && _e !== void 0 ? _e : action === null || action === void 0 ? void 0 : action.childManagerAccountID) !== null && _f !== void 0 ? _f : CONST_1.default.DEFAULT_NUMBER_ID;
    var parentReport = (0, useParentReport_1.default)(taskReport === null || taskReport === void 0 ? void 0 : taskReport.reportID);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID);
    var isTaskActionable = (0, Task_1.canActionTask)(taskReport, currentUserPersonalDetails.accountID, parentReport, isParentReportArchived);
    var hasAssignee = taskAssigneeAccountID > 0;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var avatar = (_h = (_g = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[taskAssigneeAccountID]) === null || _g === void 0 ? void 0 : _g.avatar) !== null && _h !== void 0 ? _h : Expensicons.FallbackAvatar;
    var avatarSize = CONST_1.default.AVATAR_SIZE.SMALL;
    var isDeletedParentAction = (0, ReportUtils_1.isCanceledTaskReport)(taskReport, action);
    var iconWrapperStyle = StyleUtils.getTaskPreviewIconWrapper(hasAssignee ? avatarSize : undefined);
    var shouldShowGreenDotIndicator = (0, ReportUtils_1.isOpenTaskReport)(taskReport, action) && (0, ReportUtils_1.isReportManager)(taskReport);
    if (isDeletedParentAction) {
        return <RenderHTML_1.default html={"<deleted-action>".concat(translate('parentReportAction.deletedTask'), "</deleted-action>")}/>;
    }
    var getTaskHTML = function () {
        if (isTaskCompleted) {
            return "<del><comment center>".concat(taskTitleWithoutImage, "</comment></del>");
        }
        return "<comment center>".concat(taskTitleWithoutImage, "</comment>");
    };
    return (<react_native_1.View style={[styles.chatItemMessage, !hasAssignee && styles.mv1]}>
            <PressableWithoutFeedback_1.default onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(taskReportID, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute())); }} onPressIn={function () { return (0, DeviceCapabilities_1.canUseTouchScreen)() && ControlSelection_1.default.block(); }} onPressOut={function () { return ControlSelection_1.default.unblock(); }} onLongPress={function (event) {
            return onShowContextMenu(function () {
                if (!shouldDisplayContextMenu) {
                    return;
                }
                return (0, ShowContextMenuContext_1.showContextMenuForReport)(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive);
            });
        }} shouldUseHapticsOnLongPress style={[styles.flexRow, styles.justifyContentBetween, style]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('task.task')}>
                <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsStart, styles.mr2]}>
                    <react_native_1.View style={iconWrapperStyle}>
                        <Checkbox_1.default style={[styles.mr2]} isChecked={isTaskCompleted} disabled={!isTaskActionable} onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () {
            if (isTaskCompleted) {
                (0, Task_1.reopenTask)(taskReport, taskReportID);
            }
            else {
                (0, Task_1.completeTask)(taskReport, taskReportID);
            }
        })} accessibilityLabel={translate('task.task')}/>
                    </react_native_1.View>
                    {hasAssignee && (<UserDetailsTooltip_1.default accountID={taskAssigneeAccountID}>
                            <react_native_1.View>
                                <Avatar_1.default containerStyles={[styles.mr2, isTaskCompleted ? styles.opacitySemiTransparent : undefined]} source={avatar} size={avatarSize} avatarID={taskAssigneeAccountID} type={CONST_1.default.ICON_TYPE_AVATAR}/>
                            </react_native_1.View>
                        </UserDetailsTooltip_1.default>)}
                    <react_native_1.View style={[styles.alignSelfCenter, styles.flex1]}>
                        <RenderHTML_1.default html={getTaskHTML()}/>
                    </react_native_1.View>
                </react_native_1.View>
                {shouldShowGreenDotIndicator && (<react_native_1.View style={iconWrapperStyle}>
                        <Icon_1.default src={Expensicons.DotIndicator} fill={theme.success}/>
                    </react_native_1.View>)}
                <Icon_1.default src={Expensicons.ArrowRight} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(isHovered))} additionalStyles={iconWrapperStyle}/>
            </PressableWithoutFeedback_1.default>
        </react_native_1.View>);
}
TaskPreview.displayName = 'TaskPreview';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(TaskPreview);
