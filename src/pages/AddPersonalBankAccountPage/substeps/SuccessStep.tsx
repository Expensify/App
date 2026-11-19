import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

function SuccessStep({onNext}: SubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <ConfirmationPageDefault
                heading={translate('addPersonalBankAccountPage.successTitle')}
                description={translate('addPersonalBankAccountPage.successMessage')}
                buttonText={translate('common.continue')}
                buttonSentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.ADD_PERSONAL_BANK_ACCOUNT_SUCCESS_CONTINUE}
                onButtonPress={() => onNext(true)}
            />
        </ScrollView>
    );
}

export default SuccessStep;
