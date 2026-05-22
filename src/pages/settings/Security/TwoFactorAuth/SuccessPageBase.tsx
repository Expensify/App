import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

type SuccessPageBaseProps = {
    onButtonPress: () => void;
    onBackButtonPress?: () => void;
};

function SuccessPageBase({onButtonPress, onBackButtonPress}: SuccessPageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS}
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 3,
                text: translate('twoFactorAuth.stepSuccess'),
            }}
            onBackButtonPress={onBackButtonPress}
        >
            <ConfirmationPage
                illustration={LottieAnimations.Fireworks}
                heading={translate('twoFactorAuth.enabled')}
                description={translate('twoFactorAuth.congrats')}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={onButtonPress}
                containerStyle={styles.flex1}
            />
        </TwoFactorAuthWrapper>
    );
}

export default SuccessPageBase;
