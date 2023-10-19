import _ from 'underscore';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as Wallet from '../../libs/actions/Wallet';
import ONYXKEYS from '../../ONYXKEYS';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import CONST from '../../CONST';
import userWalletPropTypes from './userWalletPropTypes';

// Steps
import OnfidoStep from './OnfidoStep';
import AdditionalDetailsStep from './AdditionalDetailsStep';
import TermsStep from './TermsStep';
import ActivateStep from './ActivateStep';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import FailedKYC from './FailedKYC';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import useLocalize from '../../hooks/useLocalize';
import useNetwork from '../../hooks/useNetwork';

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

    useEffect(() => {
        if (isOffline) {
            return;
        }

        Wallet.openEnablePaymentsPage();
    }, [isOffline]);

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

                if (userWallet.shouldShowWalletActivationSuccess) {
                    return <ActivateStep userWallet={userWallet} />;
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
