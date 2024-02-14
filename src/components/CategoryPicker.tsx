import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {Category} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import OptionsSelector from './OptionsSelector';

type CategoryPickerOnyxProps = {
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    policyRecentlyUsedCategories: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
};

type CategoryPickerProps = CategoryPickerOnyxProps & {
    /** It's used by withOnyx HOC */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string;
    selectedCategory: string;
    onSubmit: (category: Category) => void;
};

function CategoryPicker({selectedCategory, policyCategories, policyRecentlyUsedCategories, onSubmit}: CategoryPickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyCategoriesCount = OptionsListUtils.getEnabledCategoriesCount(policyCategories ?? {});
    const isCategoriesCountBelowThreshold = policyCategoriesCount < CONST.CATEGORY_LIST_THRESHOLD;

    const selectedOptions = useMemo(() => {
        if (!selectedCategory) {
            return [];
        }

        return [
            {
                name: selectedCategory,
                enabled: true,
            },
        ];
    }, [selectedCategory]);

    const sections = useMemo(() => {
        const validPolicyRecentlyUsedCategories = policyRecentlyUsedCategories?.filter((p) => !isEmptyObject(p));
        const {categoryOptions} = OptionsListUtils.getFilteredOptions(
            {},
            {},
            [],
            searchValue,
            selectedOptions,
            [],
            false,
            false,
            true,
            policyCategories ?? {},
            validPolicyRecentlyUsedCategories,
            false,
        );

        return categoryOptions;
    }, [policyCategories, policyRecentlyUsedCategories, searchValue, selectedOptions]);

    const sectionsData = sections?.[0]?.data ?? [];
    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList(sectionsData.length > 0, searchValue);
    const shouldShowTextInput = !isCategoriesCountBelowThreshold;
    const selectedOptionKey = sectionsData.filter((category) => category.searchText === selectedCategory)[0]?.keyForList;

    return (
        <OptionsSelector
            // @ts-expect-error TODO: Remove this once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TypeScript.
            optionHoveredStyle={styles.hoveredComponentBG}
            sectionHeaderStyle={styles.mt5}
            sections={sections}
            selectedOptions={selectedOptions}
            // Focus the first option when searching
            focusedIndex={0}
            // Focus the selected option on first load
            initiallyFocusedOptionKey={selectedOptionKey}
            headerMessage={headerMessage}
            shouldShowTextInput={shouldShowTextInput}
            textInputLabel={translate('common.search')}
            boldStyle
            highlightSelectedOptions
            isRowMultilineSupported
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
        />
    );
}

CategoryPicker.displayName = 'CategoryPicker';

export default withOnyx<CategoryPickerProps, CategoryPickerOnyxProps>({
    policyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
    },
    policyRecentlyUsedCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`,
    },
})(CategoryPicker);
