import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ActivateStep from './ActivateStep';
import AdditionalDetailsStep from './AdditionalDetailsStep';
import FailedKYC from './FailedKYC';
// Steps
import OnfidoStep from './OnfidoStep';
import TermsStep from './TermsStep';
import userWalletPropTypes from './userWalletPropTypes';

const propTypes = {
    /** The user's wallet */
    userWallet: userWalletPropTypes,
};

const defaultProps = {
    userWallet: {},
};

function EnablePaymentsPage({userWallet}) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const {isPendingOnfidoResult, hasFailedOnfido} = userWallet;

    useEffect(() => {
        if (isOffline) {
            return;
        }

        if (isPendingOnfidoResult || hasFailedOnfido) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET, CONST.NAVIGATION.TYPE.UP);
            return;
        }

        Wallet.openEnablePaymentsPage();
    }, [isOffline, isPendingOnfidoResult, hasFailedOnfido]);

    if (_.isEmpty(userWallet)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={userWallet.currentStep !== CONST.WALLET.STEP.ONFIDO}
            includeSafeAreaPaddingBottom={false}
            testID={EnablePaymentsPage.displayName}
        >
            {() => {
                if (userWallet.errorCode === CONST.WALLET.ERROR.KYC) {
                    return (
                        <>
                            <HeaderWithBackButton
                                title={translate('additionalDetailsStep.headerTitle')}
                                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                            />
                            <FailedKYC />
                        </>
                    );
                }

                const currentStep = userWallet.currentStep || CONST.WALLET.STEP.ADDITIONAL_DETAILS;

                switch (currentStep) {
                    case CONST.WALLET.STEP.ADDITIONAL_DETAILS:
                    case CONST.WALLET.STEP.ADDITIONAL_DETAILS_KBA:
                        return <AdditionalDetailsStep />;
                    case CONST.WALLET.STEP.ONFIDO:
                        return <OnfidoStep />;
                    case CONST.WALLET.STEP.TERMS:
                        return <TermsStep userWallet={userWallet} />;
                    case CONST.WALLET.STEP.ACTIVATE:
                        return <ActivateStep userWallet={userWallet} />;
                    default:
                        return null;
                }
            }}
        </ScreenWrapper>
    );
}

EnablePaymentsPage.displayName = 'EnablePaymentsPage';
EnablePaymentsPage.propTypes = propTypes;
EnablePaymentsPage.defaultProps = defaultProps;

export default withOnyx({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,

        // We want to refresh the wallet each time the user attempts to activate the wallet so we won't use the
        // stored values here.
        initWithStoredValues: false,
    },
})(EnablePaymentsPage);
