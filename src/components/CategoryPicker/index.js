import lodashGet from 'lodash/get';
import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './categoryPickerPropTypes';

function CategoryPicker({selectedCategory, policyCategories, policyRecentlyUsedCategories, onSubmit, shouldShowDisabledAndSelectedOption}) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const selectedOptions = useMemo(() => {
        if (!selectedCategory) {
            return [];
        }

        const isSelectedCateoryEnabled = _.some(policyCategories, (category) => category.name === selectedCategory && category.enabled);

        return [
            {
                name: selectedCategory,
                enabled: isSelectedCateoryEnabled,
                accountID: null,
                isSelected: true,
            },
        ];
    }, [selectedCategory, policyCategories]);

    const enabledCategories = useMemo(() => {
        if (!shouldShowDisabledAndSelectedOption) {
            return policyCategories;
        }
        const selectedNames = _.map(selectedOptions, (s) => s.name);
        const catergories = [...selectedOptions, ..._.filter(policyCategories, (category) => category.enabled && !selectedNames.includes(category.name))];
        return catergories;
    }, [selectedOptions, policyCategories, shouldShowDisabledAndSelectedOption]);

    const [sections, headerMessage, policyCategoriesCount, shouldShowTextInput] = useMemo(() => {
        const validPolicyRecentlyUsedCategories = _.filter(policyRecentlyUsedCategories, (p) => !_.isEmpty(p));
        const {categoryOptions} = OptionsListUtils.getFilteredOptions(
            {},
            {},
            [],
            debouncedSearchValue,
            selectedOptions,
            [],
            false,
            false,
            true,
            enabledCategories,
            validPolicyRecentlyUsedCategories,
            false,
        );

        const header = OptionsListUtils.getHeaderMessageForNonUserList(lodashGet(categoryOptions, '[0].data', []).length > 0, debouncedSearchValue);
        const policiesCount = OptionsListUtils.getEnabledCategoriesCount(_.values(policyCategories));
        const isCategoriesCountBelowThreshold = policyCategoriesCount < CONST.CATEGORY_LIST_THRESHOLD;
        const showInput = !isCategoriesCountBelowThreshold;

        return [categoryOptions, header, policiesCount, showInput];
    }, [policyCategories, policyRecentlyUsedCategories, debouncedSearchValue, selectedOptions, enabledCategories]);

    const selectedOptionKey = useMemo(
        () => lodashGet(_.filter(lodashGet(sections, '[0].data', []), (category) => category.searchText === selectedCategory)[0], 'keyForList'),
        [sections, selectedCategory],
    );

    return (
        <SelectionList
            sections={sections}
            headerMessage={headerMessage}
            textInputValue={searchValue}
            textInputLabel={shouldShowTextInput && translate('common.search')}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
            ListItem={RadioListItem}
            initiallyFocusedOptionKey={selectedOptionKey}
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
