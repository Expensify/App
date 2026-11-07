import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

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
                onButtonPress={() => onNext(true)}
            />
        </ScrollView>
    );
}

export default SuccessStep;
