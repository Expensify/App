import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Onfido from '@components/Onfido';
import type {OnfidoData} from '@components/Onfido/types';
import useLocalize from '@hooks/useLocalize';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WalletOnfido} from '@src/types/onyx';
import OnfidoPrivacy from './OnfidoPrivacy';

const DEFAULT_WALLET_ONFIDO_DATA = {
    loading: false,
    hasAcceptedPrivacyPolicy: false,
};

type OnfidoStepOnyxProps = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: OnyxEntry<WalletOnfido>;
};

type OnfidoStepProps = OnfidoStepOnyxProps;

function OnfidoStep({walletOnfidoData = DEFAULT_WALLET_ONFIDO_DATA}: OnfidoStepProps) {
    const {translate} = useLocalize();

    const shouldShowOnfido = walletOnfidoData?.hasAcceptedPrivacyPolicy && !walletOnfidoData.isLoading && !walletOnfidoData.errors && walletOnfidoData.sdkToken;

    const goBack = useCallback(() => {
        Navigation.goBack();
    }, []);

    const goToPreviousStep = useCallback(() => {
        Wallet.updateCurrentStep(CONST.WALLET.STEP.ADDITIONAL_DETAILS);
    }, []);

    const reportError = useCallback(() => {
        Growl.error(translate('onfidoStep.genericError'), 10000);
    }, [translate]);

    const verifyIdentity = useCallback(
        (data: OnfidoData) => {
            BankAccounts.verifyIdentity({
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
                    <OnfidoPrivacy />
                )}
            </FullPageOfflineBlockingView>
        </>
    );
}

OnfidoStep.displayName = 'OnfidoStep';

export default withOnyx<OnfidoStepProps, OnfidoStepOnyxProps>({
    walletOnfidoData: {
        key: ONYXKEYS.WALLET_ONFIDO,

        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(OnfidoStep);
