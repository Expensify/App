import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import LottieAnimations from '@components/LottieAnimations';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {continueSetup} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {UserWallet} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useContext} from 'react';

type ActivateStepProps = {
    userWallet: OnyxEntry<UserWallet>;
};

function ActivateStep({userWallet}: ActivateStepProps) {
    const {translate} = useLocalize();
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
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
            <ConfirmationPage>
                <ConfirmationPage.Content>
                    <ConfirmationPage.Illustration illustration={animation} />
                    <ConfirmationPage.Heading>{translate(`activateStep.${isActivatedWallet ? 'activated' : 'checkBackLater'}Title`)}</ConfirmationPage.Heading>
                    <ConfirmationPage.Description>{translate(`activateStep.${isActivatedWallet ? 'activated' : 'checkBackLater'}Message`)}</ConfirmationPage.Description>
                </ConfirmationPage.Content>
                {!!isActivatedWallet && (
                    <FixedFooter>
                        <ConfirmationPage.PrimaryButton
                            text={continueButtonText}
                            onPress={() => continueSetup(kycWallRef)}
                        />
                    </FixedFooter>
                )}
            </ConfirmationPage>
        </>
    );
}

export default ActivateStep;
