import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

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
                    buttonSentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.ABA_DEPOSIT_ACCOUNT_SUCCESS_CONTINUE}
                />
            </ScrollView>
        </InteractiveStepWrapper>
    );
}

export default ABADepositSuccess;
