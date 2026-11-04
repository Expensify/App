import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ABADepositSuccessProps = {
    /** Leaves the bank account flow */
    onFinish: () => void;
};

/**
 * Confirms that the ABA deposit account was added.
 */
function ABADepositSuccess({onFinish}: ABADepositSuccessProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <InteractiveStepWrapper
            wrapperID="ABADepositSuccess"
            handleBackButtonPress={onFinish}
            headerTitle={translate('bankAccount.addBankAccount')}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPageDefault
                    heading={translate('addPersonalBankAccountPage.successTitle')}
                    description={translate('addPersonalBankAccountPage.successMessage')}
                    buttonText={translate('common.continue')}
                    onButtonPress={onFinish}
                />
            </ScrollView>
        </InteractiveStepWrapper>
    );
}

export default ABADepositSuccess;
