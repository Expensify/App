import React from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {getCategoryListSections} from '@libs/CategoryOptionListUtils';
import type {Category} from '@libs/CategoryOptionListUtils';
import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import RadioListItem from './SelectionList/ListItem/RadioListItem';
import SelectionList from './SelectionList/SelectionListWithSections';
import type {ListItem} from './SelectionList/types';

type CategoryPickerProps = {
    policyID: string | undefined;
    selectedCategory?: string;
    onSubmit: (item: ListItem) => void;

    /**
     * If enabled, the content will have a bottom padding equal to account for the safe bottom area inset.
     */
    addBottomSafeAreaPadding?: boolean;
};

const getSelectedOptions = (selectedCategory?: string): Category[] => {
    if (!selectedCategory) {
        return [];
    }

    return [
        {
            name: selectedCategory,
            isSelected: true,
            enabled: true,
        },
    ];
};

function CategoryPicker({selectedCategory, policyID, onSubmit, addBottomSafeAreaPadding = false}: CategoryPickerProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`, {canBeMissing: true});
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`, {canBeMissing: true});
    const {isOffline} = useNetwork();

    const {translate, localeCompare} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const offlineMessage = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const selectedOptions = getSelectedOptions(selectedCategory);

    const categories = policyCategories ?? policyCategoriesDraft ?? {};
    const validPolicyRecentlyUsedCategories = policyRecentlyUsedCategories?.filter?.((p) => !isEmptyObject(p));
    const sections = getCategoryListSections({
        searchValue: debouncedSearchValue,
        selectedOptions,
        categories,
        localeCompare,
        recentlyUsedCategories: validPolicyRecentlyUsedCategories,
        translate,
    });

    const categoryData = sections?.at(0)?.data ?? [];
    const categoriesCount = getEnabledCategoriesCount(categories);
    const selectedOptionKey = categoryData.find((category) => category.searchText === selectedCategory)?.keyForList;

    const textInputOptions = {
        value: searchValue,
        label: translate('common.search'),
        onChangeText: setSearchValue,
        headerMessage: getHeaderMessageForNonUserList(categoryData.length > 0, debouncedSearchValue),
        hint: offlineMessage,
    };

    return (
        <SelectionList
            sections={sections}
            onSelectRow={onSubmit}
            ListItem={RadioListItem}
            shouldShowTextInput={categoriesCount >= CONST.STANDARD_LIST_ITEM_LIMIT}
            textInputOptions={textInputOptions}
            initiallyFocusedItemKey={selectedOptionKey}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
        />
    );
}

export default CategoryPicker;
