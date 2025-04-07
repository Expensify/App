import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {TaskListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import UserInfoCell from './UserInfoCell';

type TaskListItemRowProps = {
    item: TaskListItemType;
    showTooltip: boolean;
    containerStyle?: StyleProp<ViewStyle>;
};

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
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

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={taskItem.reportName}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
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
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell
                        accountID={item.assignee.accountID}
                        avatar={item.assignee.avatar}
                        displayName={item.formattedAssignee}
                    />
                </View>
            </View>
        </View>
    );
}

TaskListItemRow.displayName = 'TaskListItemRow';

export default TaskListItemRow;
