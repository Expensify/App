import React from 'react';
import BaseListItem from '@components/SelectionListWithSections/BaseListItem';
import type {ListItem, TaskListItemProps, TaskListItemType} from '@components/SelectionListWithSections/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import FS from '@libs/Fullstory';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import TaskListItemRow from './TaskListItemRow';

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
}: TaskListItemProps<TItem>) {
    const taskItem = item as unknown as TaskListItemType;
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(taskItem?.parentReportID)}`, {canBeMissing: true});
    const styles = useThemeStyles();
    const theme = useTheme();

    const {isLargeScreenWidth} = useResponsiveLayout();

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv3,
        styles.ph3,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
    ];

    const listItemWrapperStyle = [
        styles.flex1,
        styles.userSelectNone,
        isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
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
            containerStyle={[styles.mb2]}
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
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
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
