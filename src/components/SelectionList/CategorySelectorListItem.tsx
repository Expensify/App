import React, {useRef, useState} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import CategorySelector from '@pages/workspace/distanceRates/CategorySelector';
import type {CategorySelectorRef} from '@pages/workspace/distanceRates/CategorySelector';
import * as Policy from '@userActions/Policy/Policy';
import BaseListItem from './BaseListItem';
import type {InviteMemberListItemProps, ListItem} from './types';

function CategorySelectorListItem<TItem extends ListItem>({item, onSelectRow, isFocused}: InviteMemberListItemProps<TItem>) {
    const styles = useThemeStyles();
    const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
    const {policyID, groupID, categoryID} = item;

    if (!policyID || !groupID) {
        return;
    }

    const onSelect = (data: TItem) => {
        setIsCategoryPickerVisible(true);
        onSelectRow(data);
    };

    const setNewCategory = (selectedCategory: ListItem) => {
        if (!selectedCategory.text) {
            return;
        }
        Policy.setWorkspaceDefaultSpendCategory(policyID, groupID, selectedCategory.text);
    };

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[isFocused && styles.sidebarLinkActive]}
            pressableStyle={[styles.mt2]}
            onSelectRow={onSelect}
            isFocused={isFocused}
            showTooltip
            keyForList={item.keyForList}
        >
            <CategorySelector
                wrapperStyle={[styles.ph5]}
                focused={isFocused}
                policyID={policyID}
                label={groupID[0].toUpperCase() + groupID.slice(1)}
                defaultValue={categoryID}
                setNewCategory={setNewCategory}
                isPickerVisible={isCategoryPickerVisible}
                showPickerModal={() => setIsCategoryPickerVisible(true)}
                hidePickerModal={() => setIsCategoryPickerVisible(false)}
            />
        </BaseListItem>
    );
}

CategorySelectorListItem.displayName = 'CategorySelectorListItem';

export default CategorySelectorListItem;
