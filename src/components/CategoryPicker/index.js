import lodashGet from 'lodash/get';
import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import OptionsSelector from '@components/OptionsSelector';
import useLocalize from '@hooks/useLocalize';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './categoryPickerPropTypes';

function CategoryPicker({selectedCategory, policyCategories, policyRecentlyUsedCategories, onSubmit}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyCategoriesCount = OptionsListUtils.getEnabledCategoriesCount(_.values(policyCategories));
    const isCategoriesCountBelowThreshold = policyCategoriesCount < CONST.CATEGORY_LIST_THRESHOLD;

    const selectedOptions = useMemo(() => {
        if (!selectedCategory) {
            return [];
        }

        return [
            {
                name: selectedCategory,
                enabled: true,
                accountID: null,
            },
        ];
    }, [selectedCategory]);

    const sections = useMemo(() => {
        const validPolicyRecentlyUsedCategories = _.filter(policyRecentlyUsedCategories, (p) => !_.isEmpty(p));
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
            policyCategories,
            validPolicyRecentlyUsedCategories,
            false,
        );

        return categoryOptions;
    }, [policyCategories, policyRecentlyUsedCategories, searchValue, selectedOptions]);

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList(lodashGet(sections, '[0].data.length', 0) > 0, searchValue);
    const shouldShowTextInput = !isCategoriesCountBelowThreshold;
    const selectedOptionKey = lodashGet(_.filter(lodashGet(sections, '[0].data', []), (category) => category.searchText === selectedCategory)[0], 'keyForList');

    return (
        <OptionsSelector
            optionHoveredStyle={styles.hoveredComponentBG}
            sectionHeaderStyle={styles.mt5}
            sections={sections}
            selectedOptions={selectedOptions}
            value={searchValue}
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
CategoryPicker.propTypes = propTypes;
CategoryPicker.defaultProps = defaultProps;

export default withOnyx({
    policyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
    },
    policyRecentlyUsedCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`,
    },
})(CategoryPicker);
