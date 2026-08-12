import ConfirmationPage from '@components/ConfirmationPage';
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
            <ConfirmationPage
                heading={translate('addPersonalBankAccountPage.successTitle')}
                description={translate('addPersonalBankAccountPage.successMessage')}
                shouldShowButton
                buttonText={translate('common.continue')}
                onButtonPress={() => onNext(true)}
                containerStyle={styles.h100}
            />
        </ScrollView>
    );
}

export default SuccessStep;
