import React, {useCallback} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Onfido from '@components/Onfido';
import type {OnfidoData} from '@components/Onfido/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import {verifyIdentity as verifyIdentityAction} from '@userActions/BankAccounts';
import {updateCurrentStep} from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OnfidoPrivacy from './OnfidoPrivacy';

function OnfidoStep() {
    const {translate} = useLocalize();
    const [walletOnfidoData] = useOnyx(ONYXKEYS.WALLET_ONFIDO, {
        canBeMissing: true,
        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    });

    const shouldShowOnfido = walletOnfidoData?.hasAcceptedPrivacyPolicy && !walletOnfidoData?.isLoading && !walletOnfidoData?.errors && walletOnfidoData?.sdkToken;

    const goBack = useCallback(() => {
        Navigation.goBack();
    }, []);

    const goToPreviousStep = useCallback(() => {
        updateCurrentStep(CONST.WALLET.STEP.ADDITIONAL_DETAILS);
    }, []);

    const reportError = useCallback(() => {
        Growl.error(translate('onfidoStep.genericError'), 10000);
    }, [translate]);

    const verifyIdentity = useCallback(
        (data: OnfidoData) => {
            verifyIdentityAction({
                onfidoData: JSON.stringify({
                    ...data,
                    applicantID: walletOnfidoData?.applicantID,
                }),
            });
        },
        [walletOnfidoData?.applicantID],
    );

    return (
        <>
            <HeaderWithBackButton
                title={translate('onfidoStep.verifyIdentity')}
                onBackButtonPress={goToPreviousStep}
            />
            <FullPageOfflineBlockingView>
                {shouldShowOnfido ? (
                    <Onfido
                        sdkToken={walletOnfidoData.sdkToken ?? ''}
                        onUserExit={goBack}
                        onError={reportError}
                        onSuccess={verifyIdentity}
                    />
                ) : (
                    <OnfidoPrivacy walletOnfidoData={walletOnfidoData} />
                )}
            </FullPageOfflineBlockingView>
        </>
    );
}

export default OnfidoStep;
