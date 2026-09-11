import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedCategoryName} from '@libs/CategoryUtils';

import React from 'react';

import type {ListItem, ListItemProps} from './types';

/**
 * A menu-item row showing a category name under a spend group label. Used in workspace
 * categories settings to map categories to spend groups.
 */
function SpendCategorySelectorListItem<TItem extends ListItem>({item, onSelectRow, isFocused}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {groupID, categoryID: category} = item;

    if (!groupID) {
        return;
    }

    return (
        <ListItemComposed
            item={item}
            pressableStyle={styles.mt2}
            onSelectRow={onSelectRow}
            isFocused={isFocused}
            shouldShowTooltip
        >
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={getDecodedCategoryName(category ?? '')}
                description={groupID[0].toUpperCase() + groupID.slice(1)}
                descriptionTextStyle={styles.textNormal}
                wrapperStyle={styles.ph5}
                onPress={() => onSelectRow(item)}
                focused={isFocused}
            />
        </ListItemComposed>
    );
}

export default SpendCategorySelectorListItem;
