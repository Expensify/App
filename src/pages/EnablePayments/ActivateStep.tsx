import React, {useContext} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {continueSetup} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {UserWallet} from '@src/types/onyx';

type ActivateStepProps = {
    /** The user's wallet */
    userWallet: OnyxEntry<UserWallet>;
};

function ActivateStep({userWallet}: ActivateStepProps) {
    const {translate} = useLocalize();
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const isActivatedWallet = userWallet?.tierName && [CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM].some((name) => name === userWallet.tierName);
    const kycWallRef = useContext(KYCWallContext);

    const animation = isActivatedWallet ? LottieAnimations.Fireworks : LottieAnimations.ReviewingBankInfo;
    let continueButtonText = '';

    if (walletTerms?.chatReportID) {
        continueButtonText = translate('activateStep.continueToPayment');
    } else if (walletTerms?.source === CONST.KYC_WALL_SOURCE.ENABLE_WALLET) {
        continueButtonText = translate('common.continue');
    } else {
        continueButtonText = translate('activateStep.continueToTransfer');
    }

    return (
        <>
            <HeaderWithBackButton title={translate('activateStep.headerTitle')} />
            <ConfirmationPage
                illustration={animation}
                heading={translate(`activateStep.${isActivatedWallet ? 'activated' : 'checkBackLater'}Title`)}
                description={translate(`activateStep.${isActivatedWallet ? 'activated' : 'checkBackLater'}Message`)}
                shouldShowButton={isActivatedWallet}
                buttonText={continueButtonText}
                onButtonPress={() => continueSetup(kycWallRef)}
            />
        </>
    );
}

export default ActivateStep;
