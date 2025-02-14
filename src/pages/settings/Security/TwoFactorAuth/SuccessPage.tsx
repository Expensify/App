import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import {openLink} from '@userActions/Link';
import {clearTwoFactorAuthData} from '@userActions/TwoFactorAuthActions';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import PageWrapper from './PageWrapper';

type SuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.TWO_FACTOR_AUTH.SUCCESS>;

function SuccessPage({route}: SuccessPageProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

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
                    Navigation.goBack(route.params?.backTo ?? ROUTES.SETTINGS_2FA_ROOT.getRoute());

                    if (route.params?.forwardTo) {
                        openLink(route.params.forwardTo, environmentURL);
                    }
                }}
            />
        </PageWrapper>
    );
}

SuccessPage.displayName = 'SuccessPage';

export default SuccessPage;
