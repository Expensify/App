import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Onfido from '@components/Onfido';
import useLocalize from '@hooks/useLocalize';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import OnfidoPrivacy from './OnfidoPrivacy';
import walletOnfidoDataPropTypes from './walletOnfidoDataPropTypes';

const propTypes = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: walletOnfidoDataPropTypes,
};

const defaultProps = {
    walletOnfidoData: {
        loading: false,
        hasAcceptedPrivacyPolicy: false,
    },
};

function OnfidoStep({walletOnfidoData}) {
    const {translate} = useLocalize();

    const shouldShowOnfido = walletOnfidoData.hasAcceptedPrivacyPolicy && !walletOnfidoData.isLoading && !walletOnfidoData.error && walletOnfidoData.sdkToken;

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.HOME);
    }, []);

    const goToPreviousStep = useCallback(() => {
        Wallet.updateCurrentStep(CONST.WALLET.STEP.ADDITIONAL_DETAILS);
    }, []);

    const reportError = useCallback(() => {
        Growl.error(translate('onfidoStep.genericError'), 10000);
    }, [translate]);

    const verifyIdentity = useCallback(
        (data) => {
            BankAccounts.verifyIdentity({
                onfidoData: JSON.stringify({
                    ...data,
                    applicantID: walletOnfidoData.applicantID,
                }),
            });
        },
        [walletOnfidoData.applicantID],
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
                        sdkToken={walletOnfidoData.sdkToken}
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

OnfidoStep.propTypes = propTypes;
OnfidoStep.defaultProps = defaultProps;
OnfidoStep.displayName = 'OnfidoStep';

export default withOnyx({
    walletOnfidoData: {
        key: ONYXKEYS.WALLET_ONFIDO,

        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(OnfidoStep);
