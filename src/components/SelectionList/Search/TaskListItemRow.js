"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Badge_1 = require("@components/Badge");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var OnyxProvider_1 = require("@components/OnyxProvider");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useParentReport_1 = require("@hooks/useParentReport");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
var Task_1 = require("@libs/actions/Task");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var AvatarWithTextCell_1 = require("./AvatarWithTextCell");
var DateCell_1 = require("./DateCell");
var UserInfoCell_1 = require("./UserInfoCell");
function TitleCell(_a) {
    var taskItem = _a.taskItem, showTooltip = _a.showTooltip, isLargeScreenWidth = _a.isLargeScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    return (<TextWithTooltip_1.default text={taskItem.reportName} shouldShowTooltip={showTooltip} style={[isLargeScreenWidth ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter]}/>);
}
function DescriptionCell(_a) {
    var taskItem = _a.taskItem, showTooltip = _a.showTooltip, isLargeScreenWidth = _a.isLargeScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    return (<TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={taskItem.description} style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}/>);
}
function ActionCell(_a) {
    var _b;
    var taskItem = _a.taskItem, isLargeScreenWidth = _a.isLargeScreenWidth;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var session = (0, OnyxProvider_1.useSession)();
    var translate = (0, useLocalize_1.default)().translate;
    var parentReport = (0, useParentReport_1.default)((_b = taskItem === null || taskItem === void 0 ? void 0 : taskItem.report) === null || _b === void 0 ? void 0 : _b.reportID);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID);
    var isTaskActionable = (0, Task_1.canActionTask)(taskItem.report, session === null || session === void 0 ? void 0 : session.accountID, parentReport, isParentReportArchived);
    var isTaskCompleted = taskItem.statusNum === CONST_1.default.REPORT.STATUS_NUM.APPROVED && taskItem.stateNum === CONST_1.default.REPORT.STATE_NUM.APPROVED;
    if (isTaskCompleted) {
        return (<react_native_1.View style={[StyleUtils.getHeight(variables_1.default.h28), styles.justifyContentCenter]}>
                <Badge_1.default success text={translate('task.completed')} icon={Expensicons.Checkmark} iconStyles={styles.mr0} textStyles={StyleUtils.getFontSizeStyle(variables_1.default.fontSizeExtraSmall)} badgeStyles={[
                styles.ml0,
                styles.ph2,
                styles.gap1,
                isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                StyleUtils.getHeight(variables_1.default.h20),
                StyleUtils.getMinimumHeight(variables_1.default.h20),
                StyleUtils.getBorderColorStyle(theme.border),
            ]}/>
            </react_native_1.View>);
    }
    return (<Button_1.default small success text={translate('task.action')} style={[styles.w100]} isDisabled={!isTaskActionable} onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () {
            (0, Task_1.completeTask)(taskItem, taskItem.reportID);
        })}/>);
}
function TaskListItemRow(_a) {
    var item = _a.item, containerStyle = _a.containerStyle, showTooltip = _a.showTooltip;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var theme = (0, useTheme_1.default)();
    var isLargeScreenWidth = (0, useResponsiveLayout_1.default)().isLargeScreenWidth;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var shouldDisplayCompactArrowIcon = !!(item.parentReportIcon || item.parentReportName);
    if (!isLargeScreenWidth) {
        return (<react_native_1.View style={[containerStyle, styles.gap3]}>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    <react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.gap2, styles.flexRow]}>
                        <react_native_1.View style={[styles.mw50]}>
                            <UserInfoCell_1.default accountID={item.createdBy.accountID} avatar={item.createdBy.avatar} displayName={item.formattedCreatedBy}/>
                        </react_native_1.View>

                        {shouldDisplayCompactArrowIcon && (<Icon_1.default src={Expensicons.ArrowRightLong} width={variables_1.default.iconSizeXXSmall} height={variables_1.default.iconSizeXXSmall} fill={theme.icon}/>)}

                        <react_native_1.View style={[styles.flex1, styles.mw50]}>
                            <AvatarWithTextCell_1.default reportName={item === null || item === void 0 ? void 0 : item.parentReportName} icon={item === null || item === void 0 ? void 0 : item.parentReportIcon}/>
                        </react_native_1.View>
                    </react_native_1.View>

                    <react_native_1.View style={[StyleUtils.getWidthStyle(variables_1.default.w80)]}>
                        <ActionCell taskItem={item} showTooltip={showTooltip} isLargeScreenWidth={isLargeScreenWidth}/>
                    </react_native_1.View>
                </react_native_1.View>

                <react_native_1.View style={[styles.alignItemsCenter, styles.gap4, styles.flexRow]}>
                    <react_native_1.View style={[styles.gap1, styles.flex1]}>
                        <TitleCell taskItem={item} showTooltip={showTooltip} isLargeScreenWidth={isLargeScreenWidth}/>
                        <DescriptionCell taskItem={item} showTooltip={showTooltip} isLargeScreenWidth={isLargeScreenWidth}/>
                    </react_native_1.View>

                    <react_native_1.View style={[styles.gap2, styles.alignItemsEnd]}>
                        {!!item.assignee.accountID && (<Avatar_1.default imageStyles={[styles.alignSelfCenter]} size={CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT} source={item.assignee.avatar} name={item.formattedAssignee} type={CONST_1.default.ICON_TYPE_AVATAR} avatarID={item.assignee.accountID}/>)}

                        <DateCell_1.default created={item.created} showTooltip={showTooltip} isLargeScreenWidth={isLargeScreenWidth}/>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>);
    }
    return (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                <react_native_1.View style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.DATE, item.shouldShowYear)]}>
                    <DateCell_1.default created={item.created} showTooltip={showTooltip} isLargeScreenWidth/>
                </react_native_1.View>
                <react_native_1.View style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.TITLE)]}>
                    <TitleCell taskItem={item} showTooltip={showTooltip} isLargeScreenWidth/>
                </react_native_1.View>
                <react_native_1.View style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.DESCRIPTION)]}>
                    <DescriptionCell taskItem={item} showTooltip={showTooltip} isLargeScreenWidth/>
                </react_native_1.View>
                <react_native_1.View style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell_1.default accountID={item.createdBy.accountID} avatar={item.createdBy.avatar} displayName={item.formattedCreatedBy}/>
                </react_native_1.View>
                <react_native_1.View style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.IN)]}>
                    <AvatarWithTextCell_1.default reportName={item === null || item === void 0 ? void 0 : item.parentReportName} icon={item === null || item === void 0 ? void 0 : item.parentReportIcon}/>
                </react_native_1.View>
                <react_native_1.View style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.ASSIGNEE)]}>
                    <UserInfoCell_1.default accountID={item.assignee.accountID} avatar={item.assignee.avatar} displayName={item.formattedAssignee}/>
                </react_native_1.View>
                <react_native_1.View style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION)]}>
                    <ActionCell taskItem={item} showTooltip={showTooltip} isLargeScreenWidth/>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
TaskListItemRow.displayName = 'TaskListItemRow';
exports.default = TaskListItemRow;
