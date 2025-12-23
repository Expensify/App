import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import BaseListItem from './BaseListItem';
import type {ListItem, SpendCategorySelectorListItemProps} from './types';

function SpendCategorySelectorListItem<TItem extends ListItem>({item, onSelectRow, isFocused}: SpendCategorySelectorListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {groupID, categoryID: category} = item;

    if (!groupID) {
        return;
    }

    return (
        <BaseListItem
            item={item}
            pressableStyle={[styles.mt2]}
            onSelectRow={onSelectRow}
            isFocused={isFocused}
            showTooltip
            keyForList={item.keyForList}
            pendingAction={item.pendingAction}
        >
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={getDecodedCategoryName(category ?? '')}
                description={groupID[0].toUpperCase() + groupID.slice(1)}
                descriptionTextStyle={[styles.textNormal]}
                wrapperStyle={[styles.ph5]}
                onPress={() => onSelectRow(item)}
                focused={isFocused}
            />
        </BaseListItem>
    );
}

export default SpendCategorySelectorListItem;
