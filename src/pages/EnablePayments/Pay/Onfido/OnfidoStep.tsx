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

import React, {useCallback, useState} from 'react';

import OnfidoPrivacy from './OnfidoPrivacy';

function OnfidoStep() {
    const {translate} = useLocalize();
    const [walletOnfidoData] = useOnyx(ONYXKEYS.RAM_ONLY_WALLET_ONFIDO);

    // Onfido presents a native fullscreen view as soon as it mounts. If walletOnfido still holds a token from an earlier
    // attempt, mounting on entry would present Onfido while the previous screen is still being dismissed, which crashes
    // iOS. So Onfido never mounts until the user taps Continue on this screen.
    const [hasUserProceeded, setHasUserProceeded] = useState(false);

    // Tapping Continue re-renders before openOnfidoFlow's optimistic reset clears the old token, so for one render the
    // old token still looks ready. Wait until this tap's request is loading; after that, any ready token is the new one.
    const [hasStartedTokenRequest, setHasStartedTokenRequest] = useState(false);
    if (hasUserProceeded && walletOnfidoData?.isLoading && !hasStartedTokenRequest) {
        setHasStartedTokenRequest(true);
    }

    const isOnfidoReady = walletOnfidoData?.hasAcceptedPrivacyPolicy && !walletOnfidoData?.isLoading && !walletOnfidoData?.errors && walletOnfidoData?.sdkToken;
    const shouldShowOnfido = hasStartedTokenRequest && isOnfidoReady;

    const proceedToVerification = () => {
        setHasUserProceeded(true);
    };

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
                    <OnfidoPrivacy
                        walletOnfidoData={walletOnfidoData}
                        onProceedToVerification={proceedToVerification}
                    />
                )}
            </FullPageOfflineBlockingView>
        </>
    );
}

export default OnfidoStep;
