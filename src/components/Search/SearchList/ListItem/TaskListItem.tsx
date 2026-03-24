import React from 'react';
import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import type {ListItem} from '@components/SelectionList/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import FS from '@libs/Fullstory';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import TaskListItemRow from './TaskListItemRow';
import type {TaskListItemProps, TaskListItemType} from './types';

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
    const styles = useThemeStyles();
    const theme = useTheme();

    const {isLargeScreenWidth} = useResponsiveLayout();

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv3,
        styles.ph3,
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
        isLargeScreenWidth && {
            minHeight: variables.tableRowHeight,
            borderRadius: 0,
            paddingVertical: 8,
            borderBottomWidth: isLastItem ? 0 : 1,
            borderColor: item.isSelected ? theme.buttonHoveredBG : theme.border,
            ...(isLastItem ? {borderBottomLeftRadius: variables.componentBorderRadius, borderBottomRightRadius: variables.componentBorderRadius} : {}),
        },
    ];

    const listItemWrapperStyle = [
        styles.flex1,
        styles.userSelectNone,
        isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: isLargeScreenWidth ? 0 : variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
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
            hoverStyle={item.isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[
                styles.mh5,
                animatedHighlightStyle,
                isLargeScreenWidth && isLastItem && {borderBottomLeftRadius: variables.componentBorderRadius, borderBottomRightRadius: variables.componentBorderRadius},
            ]}
            forwardedFSClass={fsClass}
        >
            <TaskListItemRow
                item={taskItem}
                showTooltip={showTooltip}
            />
        </BaseListItem>
    );
}

export default TaskListItem;
