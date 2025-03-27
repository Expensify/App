import React, {useCallback, useEffect} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';
import {openLink} from '@userActions/Link';
import {quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

type SuccessPageProps = PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.SUCCESS>;

function SuccessPage({route}: SuccessPageProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const styles = useThemeStyles();

    const goBack = useCallback(() => {
        if (route.params?.backTo === ROUTES.REQUIRE_TWO_FACTOR_AUTH) {
            Navigation.dismissModal();
            return;
        }
        quitAndNavigateBack(route.params?.backTo ?? ROUTES.SETTINGS_2FA_ROOT.getRoute());
    }, [route.params?.backTo]);

    useEffect(() => {
        return () => {
            // When the 2FA RHP is closed, we want to remove the 2FA required page fromt the navigation stack too.
            if (route.params?.backTo !== ROUTES.REQUIRE_TWO_FACTOR_AUTH) {
                return;
            }
            Navigation.popRootToTop();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS}
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 3,
                text: translate('twoFactorAuth.stepSuccess'),
            }}
            onBackButtonPress={goBack}
        >
            <ConfirmationPage
                illustration={LottieAnimations.Fireworks}
                heading={translate('twoFactorAuth.enabled')}
                description={translate('twoFactorAuth.congrats')}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={() => {
                    goBack();
                    if (route.params?.forwardTo) {
                        openLink(route.params.forwardTo, environmentURL);
                    }
                }}
                containerStyle={styles.flex1}
            />
        </TwoFactorAuthWrapper>
    );
}

SuccessPage.displayName = 'SuccessPage';

export default SuccessPage;
