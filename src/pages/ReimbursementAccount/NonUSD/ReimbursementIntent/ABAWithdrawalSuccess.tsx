import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScrollView from '@components/ScrollView';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type ABAWithdrawalSuccessProps = {
    /** Leaves the bank account flow */
    onFinish: () => void;
};

/**
 * Confirms that the ABA withdrawal account was added to the workspace.
 */
function ABAWithdrawalSuccess({onFinish}: ABAWithdrawalSuccessProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Ensure Android's back button closes the flow like the header's back button
    useAndroidBackButtonHandler(() => {
        onFinish();
        return true;
    });

    return (
        <InteractiveStepWrapper
            wrapperID="ABAWithdrawalSuccess"
            handleBackButtonPress={onFinish}
            headerTitle={translate('bankAccount.addBankAccount')}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPageDefault
                    heading={translate('bankAccount.bbaAdded')}
                    description={translate('bankAccount.bbaAddedDescription')}
                    buttonText={translate('common.continue')}
                    onButtonPress={onFinish}
                    buttonSentryLabel={CONST.SENTRY_LABEL.REIMBURSEMENT_ACCOUNT.ABA_WITHDRAWAL_SUCCESS_CONTINUE}
                />
            </ScrollView>
        </InteractiveStepWrapper>
    );
}

export default ABAWithdrawalSuccess;
