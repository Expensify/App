import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import ConfirmationPage from '../../../../../components/ConfirmationPage';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';
import * as LottieAnimations from '../../../../../components/LottieAnimations';
import StepWrapper from '../StepWrapper/StepWrapper';
import useLocalize from '../../../../../hooks/useLocalize';
import Navigation from '../../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../../ROUTES';
import CONST from '../../../../../CONST';
import ONYXKEYS from '../../../../../ONYXKEYS';
import {TwoFactorAuthPropTypes, defaultAccount} from '../TwoFactorAuthPropTypes';

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
