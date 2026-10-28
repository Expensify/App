import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

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
                />
            </ScrollView>
        </InteractiveStepWrapper>
    );
}

export default ABAWithdrawalSuccess;
