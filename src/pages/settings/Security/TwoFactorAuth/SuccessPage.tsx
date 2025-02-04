import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import {clearTwoFactorAuthData} from '@userActions/TwoFactorAuthActions';
import ROUTES from '@src/ROUTES';
import PageWrapper from './PageWrapper';

function SuccessPage() {
    const {translate} = useLocalize();

    return (
        <PageWrapper
            stepName={SuccessPage.displayName}
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 3,
                text: translate('twoFactorAuth.stepSuccess'),
            }}
        >
            <ConfirmationPage
                illustration={LottieAnimations.Fireworks}
                heading={translate('twoFactorAuth.enabled')}
                description={translate('twoFactorAuth.congrats')}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={() => {
                    clearTwoFactorAuthData();
                    Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute());

                    // if (backTo) {
                    //     Navigation.navigate(backTo);
                    // }

                    // if (forwardTo) {
                    //     openLink(forwardTo, environmentURL);
                    // }
                }}
            />
        </PageWrapper>
    );
}

SuccessPage.displayName = 'SuccessPage';

export default SuccessPage;
