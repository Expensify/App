/** Tells the employee their Wise bank account was added, before the flow closes */
import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type WiseBankAccountAddedProps = {
    /** Closes the flow. The account already exists, so the header's back does the same. */
    onContinue: () => void;
};

function WiseBankAccountAdded({onContinue}: WiseBankAccountAddedProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="WiseBankAccountAdded"
        >
            <Header>
                <Header.BackButton onPress={onContinue} />
                <Header.Title title={translate('bankAccount.addBankAccount')} />
            </Header>
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPageDefault
                    heading={translate('addPersonalBankAccountPage.bankAccountAddedTitle')}
                    description={translate('addPersonalBankAccountPage.bankAccountAddedMessage')}
                    buttonText={translate('common.continue')}
                    onButtonPress={onContinue}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WiseBankAccountAdded;
