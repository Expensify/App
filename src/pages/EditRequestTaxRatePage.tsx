import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';

type EditRequestTaxRatePageProps = {
    /** Transaction default tax Rate value */
    defaultTaxRate: string;

    /** The policyID we are getting categories for */
    policyID: string;

    /** Callback to fire when the Save button is pressed  */
    onSubmit: () => void;
};

function EditRequestTaxRatePage({defaultTaxRate, policyID, onSubmit}: EditRequestTaxRatePageProps) {
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

EditRequestTaxRatePage.displayName = 'EditRequestTaxRatePage';

export default EditRequestTaxRatePage;
