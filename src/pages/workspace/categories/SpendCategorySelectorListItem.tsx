import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {BaseListItemProps, ListItem} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';

function SpendCategorySelectorListItem<TItem extends ListItem>({item, onSelectRow, isFocused}: BaseListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {groupID, categoryID} = item;

    if (!groupID) {
        return;
    }

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[isFocused && styles.sidebarLinkActive]}
            pressableStyle={[styles.mt2]}
            onSelectRow={onSelectRow}
            isFocused={isFocused}
            showTooltip
            keyForList={item.keyForList}
        >
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={categoryID}
                description={groupID[0].toUpperCase() + groupID.slice(1)}
                descriptionTextStyle={[styles.textNormal]}
                wrapperStyle={[styles.ph5]}
                onPress={() => onSelectRow(item)}
                focused={isFocused}
            />
        </BaseListItem>
    );
}

SpendCategorySelectorListItem.displayName = 'SpendCategorySelectorListItem';

export default SpendCategorySelectorListItem;
