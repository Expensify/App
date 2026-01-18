import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {useSession} from '@components/OnyxListItemProvider';
import type {TaskListItemType} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useParentReport from '@hooks/useParentReport';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import {canActionTask, completeTask} from '@libs/actions/Task';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import AvatarWithTextCell from './AvatarWithTextCell';
import DateCell from './DateCell';
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

function TitleCell({taskItem, showTooltip, isLargeScreenWidth}: TaskCellProps) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            text={taskItem.reportName}
            shouldShowTooltip={showTooltip}
            style={[isLargeScreenWidth ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter]}
        />
    );
}

function DescriptionCell({taskItem, showTooltip, isLargeScreenWidth}: TaskCellProps) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={taskItem.description}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}

function ActionCell({taskItem, isLargeScreenWidth}: TaskCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const session = useSession();
    const {translate} = useLocalize();
    const parentReport = useParentReport(taskItem?.report?.reportID);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const hasOutstandingChildTask = useHasOutstandingChildTask(taskItem.report);
    const parentReportAction = useParentReportAction(taskItem.report);
    const isTaskActionable = canActionTask(taskItem.report, parentReportAction, session?.accountID, parentReport, isParentReportArchived);
    const isTaskCompleted = taskItem.statusNum === CONST.REPORT.STATUS_NUM.APPROVED && taskItem.stateNum === CONST.REPORT.STATE_NUM.APPROVED;
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);

    if (isTaskCompleted) {
        return (
            <View style={[StyleUtils.getHeight(variables.h28), styles.justifyContentCenter]}>
                <Badge
                    success
                    text={translate('task.completed')}
                    icon={icons.Checkmark}
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
            isDisabled={!isTaskActionable}
            onPress={callFunctionIfActionIsAllowed(() => {
                completeTask(taskItem as Report, parentReport?.hasOutstandingChildTask ?? false, hasOutstandingChildTask, parentReportAction, taskItem.reportID);
            })}
        />
    );
}

function TaskListItemRow({item, containerStyle, showTooltip}: TaskListItemRowProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRightLong']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isLargeScreenWidth} = useResponsiveLayout();

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldDisplayCompactArrowIcon = !!(item.parentReportIcon || item.parentReportName);

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

                        {shouldDisplayCompactArrowIcon && (
                            <Icon
                                src={icons.ArrowRightLong}
                                width={variables.iconSizeXXSmall}
                                height={variables.iconSizeXXSmall}
                                fill={theme.icon}
                            />
                        )}

                        <View style={[styles.flex1, styles.mw50]}>
                            <AvatarWithTextCell
                                reportName={item?.parentReportName}
                                icon={item?.parentReportIcon}
                            />
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

                    <View style={[styles.gap2, styles.alignItemsEnd]}>
                        {!!item.assignee.accountID && (
                            <Avatar
                                imageStyles={[styles.alignSelfCenter]}
                                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                                source={item.assignee.avatar}
                                name={item.formattedAssignee}
                                type={CONST.ICON_TYPE_AVATAR}
                                avatarID={item.assignee.accountID}
                            />
                        )}

                        <DateCell
                            date={item.created}
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
                        date={item.created}
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
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell
                        accountID={item.createdBy.accountID}
                        avatar={item.createdBy.avatar}
                        displayName={item.formattedCreatedBy}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.IN)]}>
                    <AvatarWithTextCell
                        reportName={item?.parentReportName}
                        icon={item?.parentReportIcon}
                    />
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

export default TaskListItemRow;
