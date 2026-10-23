import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type CustomSubPageProps from '@pages/settings/Wallet/InternationalDepositAccount/types';

import React from 'react';

function Confirmation({onNext}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <ConfirmationPageDefault
                heading={translate('addPersonalBankAccountPage.successTitle')}
                description={translate('addPersonalBankAccountPage.successMessage')}
                buttonText={translate('common.continue')}
                onButtonPress={onNext}
            />
        </ScrollView>
    );
}

export default Confirmation;
