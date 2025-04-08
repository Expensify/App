import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {TaskListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import {completeTask} from '@libs/actions/Task';
import DateUtils from '@libs/DateUtils';
import Parser from '@libs/Parser';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ReportInfoCell from './ReportInfoCell';
import UserInfoCell from './UserInfoCell';

type TaskListItemRowProps = {
    item: TaskListItemType;
    showTooltip: boolean;
    containerStyle?: StyleProp<ViewStyle>;
};

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
};

type TaskCellProps = {
    taskItem: TaskListItemType;
} & CellProps;

function DateCell({taskItem, showTooltip, isLargeScreenWidth}: TaskCellProps) {
    const styles = useThemeStyles();

    const created = taskItem.created;
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            text={date}
            shouldShowTooltip={showTooltip}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}

function TitleCell({taskItem, showTooltip, isLargeScreenWidth}: TaskCellProps) {
    const styles = useThemeStyles();
    const taskTitle = Parser.replace(Parser.htmlToText(taskItem.reportName));

    return (
        <TextWithTooltip
            text={taskTitle}
            shouldShowTooltip={showTooltip}
            style={[isLargeScreenWidth ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter]}
        />
    );
}

function DescriptionCell({taskItem, showTooltip, isLargeScreenWidth}: TaskCellProps) {
    const styles = useThemeStyles();
    const taskDescription = Parser.replace(Parser.htmlToText(taskItem.description));

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={taskDescription}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}

function ActionCell({taskItem, isLargeScreenWidth}: TaskCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const isTaskCompleted = taskItem.statusNum === CONST.REPORT.STATUS_NUM.APPROVED && taskItem.stateNum === CONST.REPORT.STATE_NUM.APPROVED;

    if (isTaskCompleted) {
        return (
            <View style={[StyleUtils.getHeight(variables.h28), styles.justifyContentCenter]}>
                <Badge
                    success
                    text={translate('task.completed')}
                    icon={Expensicons.Checkmark}
                    iconStyles={styles.mr0}
                    textStyles={StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall)}
                    badgeStyles={[
                        styles.ml0,
                        styles.ph2,
                        styles.gap1,
                        isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                        StyleUtils.getHeight(variables.h20),
                        StyleUtils.getMinimumHeight(variables.h20),
                        StyleUtils.getBorderColorStyle(theme.border),
                    ]}
                />
            </View>
        );
    }

    return (
        <Button
            small
            success
            text={translate('task.action')}
            style={[styles.w100]}
            isDisabled={isOffline}
            onPress={callFunctionIfActionIsAllowed(() => {
                completeTask(taskItem, taskItem.reportID);
            })}
        />
    );
}

function TaskListItemRow({item, containerStyle, showTooltip}: TaskListItemRowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isLargeScreenWidth} = useResponsiveLayout();

    if (!isLargeScreenWidth) {
        return (
            <View style={[containerStyle, styles.gap3]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.gap2, styles.flexRow]}>
                        <View style={[styles.mw50]}>
                            <UserInfoCell
                                accountID={item.createdBy.accountID}
                                avatar={item.createdBy.avatar}
                                displayName={item.formattedCreatedBy}
                            />
                        </View>

                        <Icon
                            src={Expensicons.ArrowRightLong}
                            width={variables.iconSizeXXSmall}
                            height={variables.iconSizeXXSmall}
                            fill={theme.icon}
                        />

                        <View style={[styles.flex1, styles.mw50]}>
                            <ReportInfoCell reportID={item.parentReportID} />
                        </View>
                    </View>

                    <View style={[StyleUtils.getWidthStyle(variables.w80)]}>
                        <ActionCell
                            taskItem={item}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                    </View>
                </View>

                <View style={[styles.alignItemsCenter, styles.gap4, styles.flexRow]}>
                    <View style={[styles.gap1, styles.flex1]}>
                        <TitleCell
                            taskItem={item}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <DescriptionCell
                            taskItem={item}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                    </View>

                    {/* Right Col */}
                    <View style={[styles.gap2, styles.alignItemsEnd]}>
                        <Avatar
                            imageStyles={[styles.alignSelfCenter]}
                            size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                            source={item.assignee.avatar}
                            name={item.formattedAssignee}
                            type={CONST.ICON_TYPE_AVATAR}
                            avatarID={item.assignee.accountID}
                        />

                        <DateCell
                            taskItem={item}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, item.shouldShowYear)]}>
                    <DateCell
                        taskItem={item}
                        showTooltip={showTooltip}
                        isLargeScreenWidth
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TITLE)]}>
                    <TitleCell
                        taskItem={item}
                        showTooltip={showTooltip}
                        isLargeScreenWidth
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION)]}>
                    <DescriptionCell
                        taskItem={item}
                        showTooltip={showTooltip}
                        isLargeScreenWidth
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CREATED_BY)]}>
                    <UserInfoCell
                        accountID={item.createdBy.accountID}
                        avatar={item.createdBy.avatar}
                        displayName={item.formattedCreatedBy}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.IN)]}>
                    <ReportInfoCell reportID={item.parentReportID} />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ASSIGNEE)]}>
                    <UserInfoCell
                        accountID={item.assignee.accountID}
                        avatar={item.assignee.avatar}
                        displayName={item.formattedAssignee}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                    <ActionCell
                        taskItem={item}
                        showTooltip={showTooltip}
                        isLargeScreenWidth
                    />
                </View>
            </View>
        </View>
    );
}

TaskListItemRow.displayName = 'TaskListItemRow';

export default TaskListItemRow;
