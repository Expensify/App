import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import {propTypes, defaultProps} from './categoryPickerPropTypes';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import * as IOU from '../../libs/actions/IOU';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import OptionsSelector from '../OptionsSelector';
import useLocalize from '../../hooks/useLocalize';

function CategoryPicker({policyCategories, reportID, iouType, iou, policyRecentlyUsedCategories}) {
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyCategoriesCount = _.size(policyCategories);
    const isCategoriesCountBelowThreshold = policyCategoriesCount < CONST.CATEGORY_LIST_THRESHOLD;

    const selectedOptions = useMemo(() => {
        if (!iou.category) {
            return [];
        }

        return [
            {
                name: iou.category,
                enabled: true,
                accountID: null,
            },
        ];
    }, [iou.category]);

    const sections = useMemo(() => {
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
            policyRecentlyUsedCategories,
            false,
        );

        return categoryOptions;
    }, [policyCategories, policyRecentlyUsedCategories, searchValue, selectedOptions]);

    const initialFocusedIndex = useMemo(() => {
        let categoryInitialFocusedIndex = 0;

        if (!_.isEmpty(searchValue) || isCategoriesCountBelowThreshold) {
            const index = _.findIndex(lodashGet(sections, '[0].data', []), (category) => category.searchText === iou.category);

            categoryInitialFocusedIndex = index === -1 ? 0 : index;
        }

        return categoryInitialFocusedIndex;
    }, [iou.category, searchValue, isCategoriesCountBelowThreshold, sections]);

    const headerMessage = OptionsListUtils.getHeaderMessage(lodashGet(sections, '[0].data.length', 0) > 0, false, searchValue);
    const shouldShowTextInput = !isCategoriesCountBelowThreshold;

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    const updateCategory = (category) => {
        if (category.searchText === iou.category) {
            IOU.resetMoneyRequestCategory();
        } else {
            IOU.setMoneyRequestCategory(category.searchText);
        }

        navigateBack();
    };

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
            onSelectRow={updateCategory}
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
    iou: {
        key: ONYXKEYS.IOU,
    },
})(CategoryPicker);
