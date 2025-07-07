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
var AttachmentContext_1 = require("@components/AttachmentContext");
var Checkbox_1 = require("@components/Checkbox");
var Hoverable_1 = require("@components/Hoverable");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var OnyxProvider_1 = require("@components/OnyxProvider");
var PressableWithSecondaryInteraction_1 = require("@components/PressableWithSecondaryInteraction");
var RenderHTML_1 = require("@components/RenderHTML");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Parser_1 = require("@libs/Parser");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var TaskUtils_1 = require("@libs/TaskUtils");
var Session_1 = require("@userActions/Session");
var Task_1 = require("@userActions/Task");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function TaskView(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var report = _a.report, parentReport = _a.parentReport, action = _a.action;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    (0, react_1.useEffect)(function () {
        (0, Task_1.setTaskReport)(report);
    }, [report]);
    var taskTitleWithoutPre = StringUtils_1.default.removePreCodeBlock(report === null || report === void 0 ? void 0 : report.reportName);
    var titleWithoutImage = Parser_1.default.replace(Parser_1.default.htmlToMarkdown(taskTitleWithoutPre), { disabledRules: __spreadArray([], CONST_1.default.TASK_TITLE_DISABLED_RULES, true) });
    var taskTitle = "<task-title>".concat(titleWithoutImage, "</task-title>");
    var assigneeTooltipDetails = (0, ReportUtils_1.getDisplayNamesWithTooltips)((0, OptionsListUtils_1.getPersonalDetailsForAccountIDs)((report === null || report === void 0 ? void 0 : report.managerID) ? [report === null || report === void 0 ? void 0 : report.managerID] : [], personalDetails), false);
    var isOpen = (0, ReportUtils_1.isOpenTaskReport)(report);
    var isCompleted = (0, ReportUtils_1.isCompletedTaskReport)(report);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID);
    var isTaskModifiable = (0, Task_1.canModifyTask)(report, currentUserPersonalDetails.accountID, isParentReportArchived);
    var isTaskActionable = (0, Task_1.canActionTask)(report, currentUserPersonalDetails.accountID, parentReport, isParentReportArchived);
    var disableState = !isTaskModifiable;
    var isDisableInteractive = disableState || !isOpen;
    var translate = (0, useLocalize_1.default)().translate;
    var accountID = (_b = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var contextValue = (0, react_1.useMemo)(function () { return ({
        anchor: null,
        report: report,
        isReportArchived: false,
        action: action,
        transactionThreadReport: undefined,
        checkIfContextMenuActive: function () { },
        isDisabled: true,
        onShowContextMenu: function (callback) { return callback(); },
        shouldDisplayContextMenu: false,
    }); }, [report, action]);
    var attachmentContextValue = (0, react_1.useMemo)(function () { return ({ type: CONST_1.default.ATTACHMENT_TYPE.ONBOARDING, accountID: accountID }); }, [accountID]);
    return (<ShowContextMenuContext_1.ShowContextMenuContext.Provider value={contextValue}>
            <AttachmentContext_1.AttachmentContext.Provider value={attachmentContextValue}>
                <OfflineWithFeedback_1.default shouldShowErrorMessages errors={(_d = (_c = report === null || report === void 0 ? void 0 : report.errorFields) === null || _c === void 0 ? void 0 : _c.editTask) !== null && _d !== void 0 ? _d : (_e = report === null || report === void 0 ? void 0 : report.errorFields) === null || _e === void 0 ? void 0 : _e.createTask} onClose={function () { return (0, Task_1.clearTaskErrors)(report === null || report === void 0 ? void 0 : report.reportID); }} errorRowStyles={styles.ph5}>
                    <Hoverable_1.default>
                        {function (hovered) { return (<PressableWithSecondaryInteraction_1.default onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function (e) {
                if (isDisableInteractive) {
                    return;
                }
                if (e && e.type === 'click') {
                    e.currentTarget.blur();
                }
                Navigation_1.default.navigate(ROUTES_1.default.TASK_TITLE.getRoute(report === null || report === void 0 ? void 0 : report.reportID, Navigation_1.default.getReportRHPActiveRoute()));
            })} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.ph5,
                    styles.pv2,
                    StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(hovered, pressed, false, disableState, !isDisableInteractive), true),
                    isDisableInteractive && styles.cursorDefault,
                ];
            }} accessibilityLabel={taskTitle || translate('task.task')} disabled={isDisableInteractive}>
                                {function (_a) {
                var _b;
                var pressed = _a.pressed;
                return (<OfflineWithFeedback_1.default pendingAction={(_b = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _b === void 0 ? void 0 : _b.reportName}>
                                        <Text_1.default style={styles.taskTitleDescription}>{translate('task.title')}</Text_1.default>
                                        <react_native_1.View style={[styles.flexRow, styles.flex1]}>
                                            <Checkbox_1.default onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () {
                        // If we're already navigating to these task editing pages, early return not to mark as completed, otherwise we would have not found page.
                        if ((0, TaskUtils_1.isActiveTaskEditRoute)(report === null || report === void 0 ? void 0 : report.reportID)) {
                            return;
                        }
                        if (isCompleted) {
                            (0, Task_1.reopenTask)(report);
                        }
                        else {
                            (0, Task_1.completeTask)(report);
                        }
                    })} isChecked={isCompleted} style={styles.taskMenuItemCheckbox} containerSize={24} containerBorderRadius={8} caretSize={16} accessibilityLabel={taskTitle || translate('task.task')} disabled={!isTaskActionable}/>
                                            <react_native_1.View style={[styles.flexRow, styles.flex1]}>
                                                <RenderHTML_1.default html={taskTitle}/>
                                            </react_native_1.View>
                                            {!isDisableInteractive && (<react_native_1.View style={styles.taskRightIconContainer}>
                                                    <Icon_1.default additionalStyles={[styles.alignItemsCenter]} src={Expensicons.ArrowRight} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(hovered, pressed, false, disableState))}/>
                                                </react_native_1.View>)}
                                        </react_native_1.View>
                                    </OfflineWithFeedback_1.default>);
            }}
                            </PressableWithSecondaryInteraction_1.default>); }}
                    </Hoverable_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(_f = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _f === void 0 ? void 0 : _f.description}>
                        <MenuItemWithTopDescription_1.default shouldRenderAsHTML description={translate('task.description')} title={(_g = report === null || report === void 0 ? void 0 : report.description) !== null && _g !== void 0 ? _g : ''} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_DESCRIPTION.getRoute(report === null || report === void 0 ? void 0 : report.reportID, Navigation_1.default.getReportRHPActiveRoute())); }} shouldShowRightIcon={!isDisableInteractive} disabled={disableState} wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]} shouldGreyOutWhenDisabled={false} numberOfLinesTitle={0} interactive={!isDisableInteractive} shouldUseDefaultCursorWhenDisabled/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(_h = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _h === void 0 ? void 0 : _h.managerID}>
                        {(report === null || report === void 0 ? void 0 : report.managerID) ? (<MenuItem_1.default label={translate('task.assignee')} title={(0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: report.managerID })} icon={(0, OptionsListUtils_1.getAvatarsForAccountIDs)([(_j = report === null || report === void 0 ? void 0 : report.managerID) !== null && _j !== void 0 ? _j : CONST_1.default.DEFAULT_NUMBER_ID], personalDetails)} iconType={CONST_1.default.ICON_TYPE_AVATAR} avatarSize={CONST_1.default.AVATAR_SIZE.SMALLER} titleStyle={styles.assigneeTextStyle} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.TASK_ASSIGNEE.getRoute(report === null || report === void 0 ? void 0 : report.reportID, Navigation_1.default.getReportRHPActiveRoute())); }} shouldShowRightIcon={!isDisableInteractive} disabled={disableState} wrapperStyle={[styles.pv2]} isSmallAvatarSubscriptMenu shouldGreyOutWhenDisabled={false} interactive={!isDisableInteractive} titleWithTooltips={assigneeTooltipDetails} shouldUseDefaultCursorWhenDisabled/>) : (<MenuItemWithTopDescription_1.default description={translate('task.assignee')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.TASK_ASSIGNEE.getRoute(report === null || report === void 0 ? void 0 : report.reportID, Navigation_1.default.getReportRHPActiveRoute())); }} shouldShowRightIcon={!isDisableInteractive} disabled={disableState} wrapperStyle={[styles.pv2]} shouldGreyOutWhenDisabled={false} interactive={!isDisableInteractive} shouldUseDefaultCursorWhenDisabled/>)}
                    </OfflineWithFeedback_1.default>
                </OfflineWithFeedback_1.default>
            </AttachmentContext_1.AttachmentContext.Provider>
        </ShowContextMenuContext_1.ShowContextMenuContext.Provider>);
}
TaskView.displayName = 'TaskView';
exports.default = TaskView;
