import React from 'react';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import styles from '../styles/styles';
import Text from '../components/Text';
import CategoryPicker from '../components/CategoryPicker';

const propTypes = {
    /** Transaction default category value */
    defaultCategory: PropTypes.string.isRequired,

    /** The policyID we are getting categories for */
    policyID: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestCategoryPage({defaultCategory, policyID, onSubmit}) {
    const {translate} = useLocalize();

    const selectCategory = (category) => {
        onSubmit({
            category: category.searchText,
        });
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestCategoryPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={Navigation.goBack}
            />
            <Text style={[styles.ph5, styles.pv3]}>{translate('iou.categorySelection')}</Text>
            <CategoryPicker
                selectedCategory={defaultCategory}
                policyID={policyID}
                onSubmit={selectCategory}
            />
        </ScreenWrapper>
    );
}

EditRequestCategoryPage.propTypes = propTypes;
EditRequestCategoryPage.displayName = 'EditRequestCategoryPage';

export default EditRequestCategoryPage;
