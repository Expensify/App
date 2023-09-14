import React from 'react';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
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

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={Navigation.goBack}
            />

            <CategoryPicker
                selectedCategory={defaultCategory}
                policyID={policyID}
                onSubmit={(category) =>
                    onSubmit({
                        category: category.searchText,
                    })
                }
            />
        </ScreenWrapper>
    );
}

EditRequestCategoryPage.propTypes = propTypes;
EditRequestCategoryPage.displayName = 'EditRequestCategoryPage';

export default EditRequestCategoryPage;
