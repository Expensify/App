import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type CustomSubPageProps from '@pages/settings/Wallet/InternationalDepositAccount/types';

function Confirmation({onNext}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <ConfirmationPage
                heading={translate('addPersonalBankAccountPage.successTitle')}
                description={translate('addPersonalBankAccountPage.successMessage')}
                shouldShowButton
                buttonText={translate('common.continue')}
                onButtonPress={onNext}
                containerStyle={styles.h100}
            />
        </ScrollView>
    );
}

export default Confirmation;
