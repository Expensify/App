import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import {propTypes, defaultProps} from './categoryPickerPropTypes';
import OptionsList from '../OptionsList';
import styles from '../../styles/styles';
import ScreenWrapper from '../ScreenWrapper';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as IOU from '../../libs/actions/IOU';
import * as OptionsListUtils from '../../libs/OptionsListUtils';

function CategoryPicker({policyCategories, reportID, iouType}) {
    const sections = useMemo(
        () =>
            OptionsListUtils.getNewChatOptions(
                {},
                {},
                [],
                // Search
                '',
                // Selected options
                [],
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
            ).categoryOptions,
        [policyCategories],
    );

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    const updateCategory = (category) => {
        IOU.setMoneyRequestCategory(category.keyForList);
        navigateBack();
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <OptionsList
                    optionHoveredStyle={styles.hoveredComponentBG}
                    contentContainerStyles={[safeAreaPaddingBottomStyle]}
                    sections={sections}
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
})(CategoryPicker);
