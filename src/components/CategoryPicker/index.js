import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import {propTypes, defaultProps} from './categoryPickerPropTypes';
import OptionsList from '../OptionsList';
import styles from '../../styles/styles';
import ScreenWrapper from '../ScreenWrapper';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as IOU from '../../libs/actions/IOU';
import * as OptionsListUtils from '../../libs/OptionsListUtils';

function CategoryPicker({policyCategories, reportID, iouType, iou}) {
    const sections = useMemo(() => {
        const selectedCategories = [];

        const selectedCategory = _.find(policyCategories, ({name}) => name === iou.category);

        if (selectedCategory) {
            selectedCategories.push(selectedCategory);
        }

        return OptionsListUtils.getNewChatOptions(
            {},
            {},
            [],
            // Search
            '',
            // Selected options
            selectedCategories,
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
    }, [policyCategories, iou.category]);

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    const updateCategory = (category) => {
        IOU.setMoneyRequestCategory(category.searchText);
        navigateBack();
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <OptionsList
                    optionHoveredStyle={styles.hoveredComponentBG}
                    contentContainerStyles={[safeAreaPaddingBottomStyle]}
                    sections={sections}
                    boldStyle
                    onSelectRow={updateCategory}
                />
            )}
        </ScreenWrapper>
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
