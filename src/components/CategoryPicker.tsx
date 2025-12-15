import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
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
import SelectionList from './SelectionListWithSections';
import RadioListItem from './SelectionListWithSections/RadioListItem';
import type {ListItem} from './SelectionListWithSections/types';

type CategoryPickerProps = {
    policyID: string | undefined;
    selectedCategory?: string;
    onSubmit: (item: ListItem) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;

    /**
     * If enabled, the content will have a bottom padding equal to account for the safe bottom area inset.
     */
    addBottomSafeAreaPadding?: boolean;
};

function CategoryPicker({selectedCategory, policyID, onSubmit, addBottomSafeAreaPadding = false, contentContainerStyle}: CategoryPickerProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`, {canBeMissing: true});
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`, {canBeMissing: true});
    const {isOffline} = useNetwork();

    const {translate, localeCompare} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const offlineMessage = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const selectedOptions = useMemo((): Category[] => {
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
    }, [selectedCategory]);

    const [sections, headerMessage, shouldShowTextInput] = useMemo(() => {
        const categories = policyCategories ?? policyCategoriesDraft ?? {};
        const validPolicyRecentlyUsedCategories = policyRecentlyUsedCategories?.filter?.((p) => !isEmptyObject(p));
        const categoryOptions = getCategoryListSections({
            searchValue: debouncedSearchValue,
            selectedOptions,
            categories,
            localeCompare,
            recentlyUsedCategories: validPolicyRecentlyUsedCategories,
            translate,
        });

        const categoryData = categoryOptions?.at(0)?.data ?? [];
        const header = getHeaderMessageForNonUserList(categoryData.length > 0, debouncedSearchValue);
        const categoriesCount = getEnabledCategoriesCount(categories);
        const isCategoriesCountBelowThreshold = categoriesCount < CONST.STANDARD_LIST_ITEM_LIMIT;
        const showInput = !isCategoriesCountBelowThreshold;

        return [categoryOptions, header, showInput];
    }, [policyCategories, policyCategoriesDraft, policyRecentlyUsedCategories, debouncedSearchValue, selectedOptions, localeCompare, translate]);

    const selectedOptionKey = useMemo(() => (sections?.at(0)?.data ?? []).find((category) => category.searchText === selectedCategory)?.keyForList, [sections, selectedCategory]);

    return (
        <SelectionList
            sections={sections}
            headerMessage={headerMessage}
            textInputValue={searchValue}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            textInputHint={offlineMessage}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
            ListItem={RadioListItem}
            initiallyFocusedOptionKey={selectedOptionKey ?? undefined}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            contentContainerStyle={contentContainerStyle}
        />
    );
}

CategoryPicker.displayName = 'CategoryPicker';

export default CategoryPicker;
