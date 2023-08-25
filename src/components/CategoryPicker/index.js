import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import {propTypes, defaultProps} from './categoryPickerPropTypes';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as IOU from '../../libs/actions/IOU';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import OptionsSelector from '../OptionsSelector';
import useLocalize from '../../hooks/useLocalize';

function CategoryPicker({policyCategories, reportID, iouType, iou}) {
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const selectedOptions = useMemo(() => {
        const selectedCategories = [];

        const selectedCategory = _.find(policyCategories, ({name}) => name === iou.category);

        if (selectedCategory) {
            selectedCategories.push({...selectedCategory, accountID: null});
        }

        return selectedCategories;
    }, [policyCategories, iou.category]);

    const sections = OptionsListUtils.getNewChatOptions(
        {},
        {},
        [],
        // Search
        searchValue,
        // Selected options
        selectedOptions,
        [],
        false,
        false,
        // Include categories
        true,
        // Categories
        policyCategories,
        // Recently used categories
        {},
        false,
    ).categoryOptions;

    const headerMessage = OptionsListUtils.getHeaderMessage(lodashGet(sections, '[0].data.length', 0) > 0, false, searchValue);

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    const updateCategory = (category) => {
        IOU.setMoneyRequestCategory(category.searchText);
        navigateBack();
    };

    return (
        <OptionsSelector
            optionHoveredStyle={styles.hoveredComponentBG}
            sections={sections}
            selectedOptions={selectedOptions}
            value={searchValue}
            boldStyle
            headerMessage={headerMessage}
            textInputLabel={translate('common.search')}
            highlightSelectedOptions
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
    iou: {
        key: ONYXKEYS.IOU,
    },
})(CategoryPicker);
