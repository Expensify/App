import React, {useCallback} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';
import {closeReactNativeApp} from '@userActions/HybridApp';
import {openLink} from '@userActions/Link';
import {quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

type SuccessPageProps = PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.SUCCESS>;

function SuccessPage({route}: SuccessPageProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const styles = useThemeStyles();

    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const isClassicRedirectBlocked = shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP);
    const isClassicRedirectDismissed = tryNewDot?.classicRedirect?.dismissed;

    const goBack = useCallback(() => {
        quitAndNavigateBack(route.params?.backTo ?? ROUTES.SETTINGS_2FA_ROOT.getRoute());
    }, [route.params?.backTo]);

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
                    if (CONFIG.IS_HYBRID_APP && isClassicRedirectDismissed && !isClassicRedirectBlocked) {
                        closeReactNativeApp({shouldSetNVP: false, isTrackingGPS: false});
                        return;
                    }
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

export default SuccessPage;
