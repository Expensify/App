import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import useLocalize from '@hooks/useLocalize';
import type {CustomSubStepProps} from '@pages/settings/Wallet/InternationalDepositAccount/types';

function Confirmation({onNext}: CustomSubStepProps) {
    const {translate} = useLocalize();

    return (
        <ConfirmationPage
            heading={translate('addPersonalBankAccountPage.successTitle')}
            description={translate('addPersonalBankAccountPage.successMessage')}
            shouldShowButton
            buttonText={translate('common.continue')}
            onButtonPress={onNext}
        />
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
