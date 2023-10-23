import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import {propTypes, defaultProps} from './categoryPickerPropTypes';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import OptionsSelector from '../OptionsSelector';
import useLocalize from '../../hooks/useLocalize';

function CategoryPicker({selectedCategory, policyCategories, policyRecentlyUsedCategories, onSubmit}) {
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

    const initialFocusedIndex = useMemo(() => {
        let categoryInitialFocusedIndex = 0;

        if (!_.isEmpty(searchValue) || isCategoriesCountBelowThreshold) {
            const index = _.findIndex(lodashGet(sections, '[0].data', []), (category) => category.searchText === selectedCategory);

            categoryInitialFocusedIndex = index === -1 ? 0 : index;
        }

        return categoryInitialFocusedIndex;
    }, [selectedCategory, searchValue, isCategoriesCountBelowThreshold, sections]);

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList(lodashGet(sections, '[0].data.length', 0) > 0, searchValue);
    const shouldShowTextInput = !isCategoriesCountBelowThreshold;

    return (
        <OptionsSelector
            optionHoveredStyle={styles.hoveredComponentBG}
            sections={sections}
            selectedOptions={selectedOptions}
            value={searchValue}
            initialFocusedIndex={initialFocusedIndex}
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
