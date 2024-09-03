import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/RadioListItem';
import type {ListItem} from './SelectionList/types';

type CategoryPickerOnyxProps = {
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    policyCategoriesDraft: OnyxEntry<OnyxTypes.PolicyCategories>;
    policyRecentlyUsedCategories: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
};

type CategoryPickerProps = CategoryPickerOnyxProps & {
    /** It's used by withOnyx HOC */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string;
    selectedCategory?: string;
    onSubmit: (item: ListItem) => void;

    /** Whether SectionList should have overflow: "auto" enabled */
    shouldAddOverflow?: boolean;
};

function CategoryPicker({selectedCategory, policyCategories, policyRecentlyUsedCategories, policyCategoriesDraft, onSubmit, shouldAddOverflow = false}: CategoryPickerProps) {
    const styles = useThemeStyles();
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    // Ensure scrolling works for the SectionList in a nested lists structure involving a Modal on the web.
    const sectionListStyles = isWeb && shouldAddOverflow && [styles.overflowAuto, styles.flex1];

    const selectedOptions = useMemo(() => {
        if (!selectedCategory) {
            return [];
        }

        return [
            {
                name: selectedCategory,
                accountID: undefined,
                isSelected: true,
            },
        ];
    }, [selectedCategory]);

    const [sections, headerMessage, shouldShowTextInput] = useMemo(() => {
        const categories = policyCategories ?? policyCategoriesDraft ?? {};
        const validPolicyRecentlyUsedCategories = policyRecentlyUsedCategories?.filter?.((p) => !isEmptyObject(p));
        const {categoryOptions} = OptionsListUtils.getFilteredOptions(
            [],
            [],
            [],
            debouncedSearchValue,
            selectedOptions,
            [],
            false,
            false,
            true,
            categories,
            validPolicyRecentlyUsedCategories,
            false,
        );

        const categoryData = categoryOptions?.[0]?.data ?? [];
        const header = OptionsListUtils.getHeaderMessageForNonUserList(categoryData.length > 0, debouncedSearchValue);
        const categoriesCount = OptionsListUtils.getEnabledCategoriesCount(categories);
        const isCategoriesCountBelowThreshold = categoriesCount < CONST.CATEGORY_LIST_THRESHOLD;
        const showInput = !isCategoriesCountBelowThreshold;

        return [categoryOptions, header, showInput];
    }, [policyRecentlyUsedCategories, debouncedSearchValue, selectedOptions, policyCategories, policyCategoriesDraft]);

    const selectedOptionKey = useMemo(() => (sections?.[0]?.data ?? []).filter((category) => category.searchText === selectedCategory)[0]?.keyForList, [sections, selectedCategory]);

    return (
        <SelectionList
            sections={sections}
            headerMessage={headerMessage}
            textInputValue={searchValue}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
            ListItem={RadioListItem}
            initiallyFocusedOptionKey={selectedOptionKey ?? undefined}
            isRowMultilineSupported
            sectionListStyle={sectionListStyles}
        />
    );
}

CategoryPicker.displayName = 'CategoryPicker';

export default withOnyx<CategoryPickerProps, CategoryPickerOnyxProps>({
    policyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
    },
    policyCategoriesDraft: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`,
    },
    policyRecentlyUsedCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`,
    },
})(CategoryPicker);
