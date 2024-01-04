import PropTypes from 'prop-types';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';

const propTypes = {
    /** Transaction default tax Rate value */
    defaultTaxRate: PropTypes.string.isRequired,

    /** The policyID we are getting categories for */
    policyID: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestTaxRatePage({defaultTaxRate, policyID, onSubmit}) {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestTaxRatePage.displayName}
        >
            {({insets}) => (
                <>
                    <HeaderWithBackButton title={translate('iou.taxRate')} />
                    <TaxPicker
                        selectedTaxRate={defaultTaxRate}
                        policyID={policyID}
                        insets={insets}
                        onSubmit={onSubmit}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

EditRequestTaxRatePage.propTypes = propTypes;
EditRequestTaxRatePage.displayName = 'EditRequestTaxRatePage';

export default EditRequestTaxRatePage;
