import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import type {ListItem} from '@components/SelectionList/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import FS from '@libs/Fullstory';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import TaskListItemRow from './TaskListItemRow';
import type {TaskListItemProps, TaskListItemType} from './types';

/**
 * A task row in search results showing date, title, description, creator, assignee,
 * and a complete/completed badge action.
 */
function TaskListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    allReports,
    isLastItem,
}: TaskListItemProps<TItem>) {
    const taskItem = item as unknown as TaskListItemType;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${taskItem?.parentReportID}`];
    const parentReportID = taskItem?.parentReportID;
    const parentReportAttributeNameSelector = (value: OnyxEntry<ReportAttributesDerivedValue>) => (parentReportID ? value?.reports?.[parentReportID]?.reportName : undefined);
    const [liveParentReportAttributeName] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: parentReportAttributeNameSelector}, [parentReportID]);
    const liveTaskItem: TaskListItemType =
        liveParentReportAttributeName && liveParentReportAttributeName !== taskItem.parentReportName ? {...taskItem, parentReportName: liveParentReportAttributeName} : taskItem;
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const {isLargeScreenWidth} = useResponsiveLayout();
    const {isSelected} = useRowSelection(item.keyForList);

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv3,
        styles.ph5,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        isSelected && styles.searchRowSelectedBG,
        styles.mh0,
        isLargeScreenWidth && StyleUtils.getSearchTableRowPressableStyle(!!isLastItem, isSelected, {vertical: variables.tableRowPaddingVertical}),
    ];

    const listItemWrapperStyle = [
        styles.flex1,
        styles.userSelectNone,
        isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: StyleUtils.getSearchTableHighlightBorderRadius(isLargeScreenWidth),
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.appBG,
        shouldApplyOtherStyles: !isLargeScreenWidth,
    });

    const fsClass = FS.getChatFSClass(parentReport);

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={listItemWrapperStyle}
            containerStyle={!isLargeScreenWidth && [styles.mb2]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            onLongPressRow={onLongPressRow}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={isSelected && styles.searchRowSelectedBG}
            pressableWrapperStyle={[!isLargeScreenWidth && styles.mh5, animatedHighlightStyle]}
            forwardedFSClass={fsClass}
        >
            <TaskListItemRow
                item={liveTaskItem}
                showTooltip={showTooltip}
            />
        </BaseListItem>
    );
}

export default TaskListItem;
