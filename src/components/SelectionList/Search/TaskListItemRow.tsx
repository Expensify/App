import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import type {TaskListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
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
            shouldShowTooltip={showTooltip}
            text={date}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}

function TitleCell({taskItem, showTooltip, isLargeScreenWidth}: TaskCellProps) {
    const styles = useThemeStyles();
    const taskTitle = Parser.replace(Parser.htmlToText(taskItem.reportName));

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={taskTitle}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
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
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const isTaskCompleted = taskItem.statusNum === CONST.REPORT.STATUS_NUM.APPROVED && taskItem.stateNum === CONST.REPORT.STATE_NUM.APPROVED;

    const completeTaskCall = callFunctionIfActionIsAllowed(() => {
        completeTask(taskItem, taskItem.reportID);
    });

    if (isTaskCompleted) {
        return (
            <View style={[StyleUtils.getHeight(variables.h28), styles.justifyContentCenter]}>
                <Badge
                    success
                    text={translate('task.completed')}
                    icon={Expensicons.Checkmark}
                    badgeStyles={[
                        styles.ml0,
                        styles.ph2,
                        styles.gap1,
                        isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                        StyleUtils.getHeight(variables.h20),
                        StyleUtils.getMinimumHeight(variables.h20),
                        StyleUtils.getBorderColorStyle(theme.border),
                    ]}
                    textStyles={StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall)}
                    iconStyles={styles.mr0}
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
            onPress={completeTaskCall}
        />
    );
}

function TaskListItemRow({item, containerStyle, showTooltip}: TaskListItemRowProps) {
    const styles = useThemeStyles();
    // const {isLargeScreenWidth} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    // const theme = useTheme();

    // if (!isLargeScreenWidth) {
    //     return (
    //         <View style={containerStyle}>
    //             {showItemHeaderOnNarrowLayout && (
    //                 <ExpenseItemHeaderNarrow
    //                     text={item.text}
    //                     participantFrom={item.from}
    //                     participantFromDisplayName={item.formattedFrom}
    //                     participantTo={item.to}
    //                     participantToDisplayName={item.formattedTo}
    //                     onButtonPress={onButtonPress}
    //                     action={item.action}
    //                     isSelected={item.isSelected}
    //                     isDisabled={item.isDisabled}
    //                     isLoading={isLoading}
    //                 />
    //             )}

    //             <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3]}>

    //                 <View style={[styles.flex2, !item.category && styles.justifyContentCenter, styles.gap1]}>
    //                     <MerchantCell
    //                         transactionItem={item}
    //                         showTooltip={showTooltip}
    //                         isLargeScreenWidth={false}
    //                     />
    //                     {!!item.category && (
    //                         <View style={[styles.flexRow, styles.flex1, styles.alignItemsEnd]}>
    //                             <CategoryCell
    //                                 isLargeScreenWidth={false}
    //                                 showTooltip={showTooltip}
    //                                 transactionItem={item}
    //                             />
    //                         </View>
    //                     )}
    //                 </View>
    //                 <View style={[styles.alignItemsEnd, styles.flex1, styles.gap1, styles.justifyContentBetween]}>
    //                     <TotalCell
    //                         showTooltip={showTooltip}
    //                         transactionItem={item}
    //                         isLargeScreenWidth={false}
    //                         isChildListItem={isChildListItem}
    //                     />
    //                     <View style={[styles.flexRow, styles.gap1, styles.justifyContentCenter, styles.alignItemsCenter]}>
    //                         <TypeCell
    //                             transactionItem={item}
    //                             isLargeScreenWidth={false}
    //                             showTooltip={false}
    //                         />
    //                         <DateCell
    //                             transactionItem={item}
    //                             showTooltip={showTooltip}
    //                             isLargeScreenWidth={false}
    //                         />
    //                     </View>
    //                 </View>
    //             </View>
    //         </View>
    //     );
    // }

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
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell
                        accountID={item.createdBy.accountID}
                        avatar={item.createdBy.avatar}
                        displayName={item.formattedCreatedBy}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.IN)]}>
                    <ReportInfoCell reportID={item.parentReportID} />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
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
