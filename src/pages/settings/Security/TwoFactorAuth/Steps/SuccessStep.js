import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import * as LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SuccessStep({account = defaultAccount}) {
    const {translate} = useLocalize();

    useEffect(() => {
        if (account.twoFactorAuthStep === 'SUCCESS') {
            return;
        }

        if (account.requiresTwoFactorAuth) {
            Navigation.navigate(ROUTES.SETTINGS_2FA.ENABLED, CONST.NAVIGATION.TYPE.FORCED_UP);
        } else {
            Navigation.navigate(ROUTES.SETTINGS_2FA.CODES, CONST.NAVIGATION.TYPE.FORCED_UP);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 3,
                text: translate('twoFactorAuth.stepSuccess'),
            }}
        >
            <ConfirmationPage
                animation={LottieAnimations.Fireworks}
                heading={translate('twoFactorAuth.enabled')}
                description={translate('twoFactorAuth.congrats')}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={() => {
                    TwoFactorAuthActions.clearTwoFactorAuthData();
                    Navigation.navigate(ROUTES.SETTINGS_2FA.ENABLED, CONST.NAVIGATION.TYPE.FORCED_UP);
                }}
            />
        </StepWrapper>
    );
}

SuccessStep.propTypes = TwoFactorAuthPropTypes;

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(SuccessStep);
