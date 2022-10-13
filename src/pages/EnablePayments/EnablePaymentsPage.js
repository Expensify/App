import _ from 'underscore';
import React from 'react';
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
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import FailedKYC from './FailedKYC';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import NetworkConnection from '../../libs/NetworkConnection';

const propTypes = {
    /** The user's wallet */
    userWallet: userWalletPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
};

class EnablePaymentsPage extends React.Component {
    componentDidMount() {
        Wallet.openEnablePaymentsPage();
        this.unsubscribe = NetworkConnection.onReconnect(Wallet.openEnablePaymentsPage);
    }

    componentWillUnmount() {
        if (!this.unsubscribe) {
            return;
        }

        this.unsubscribe();
    }

    render() {
        if (_.isEmpty(this.props.userWallet)) {
            return <FullScreenLoadingIndicator />;
        }

        return (
            <ScreenWrapper>
                {(() => {
                    if (this.props.userWallet.errorCode === CONST.WALLET.ERROR.KYC) {
                        return (
                            <>
                                <HeaderWithCloseButton
                                    title={this.props.translate('additionalDetailsStep.headerTitle')}
                                    onCloseButtonPress={() => Navigation.dismissModal()}
                                />
                                <FailedKYC />
                            </>
                        );
                    }

                    if (this.props.userWallet.shouldShowWalletActivationSuccess) {
                        return (
                            <ActivateStep userWallet={this.props.userWallet} />
                        );
                    }

                    const currentStep = this.props.userWallet.currentStep || CONST.WALLET.STEP.ADDITIONAL_DETAILS;
                    return (
                        <>
                            {currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS && <AdditionalDetailsStep walletAdditionalDetailsDraft={this.props.walletAdditionalDetailsDraft} />}
                            {currentStep === CONST.WALLET.STEP.ONFIDO && <OnfidoStep walletAdditionalDetailsDraft={this.props.walletAdditionalDetailsDraft} />}
                            {currentStep === CONST.WALLET.STEP.TERMS && <TermsStep />}
                            {currentStep === CONST.WALLET.STEP.ACTIVATE && <ActivateStep userWallet={this.props.userWallet} />}
                        </>
                    );
                })()}
            </ScreenWrapper>
        );
    }
}

EnablePaymentsPage.propTypes = propTypes;
EnablePaymentsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        userWallet: {
            key: ONYXKEYS.USER_WALLET,

            // We want to refresh the wallet each time the user attempts to activate the wallet so we won't use the
            // stored values here.
            initWithStoredValues: false,
        },
        walletAdditionalDetailsDraft: {
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS_DRAFT,
        },
    }),
)(EnablePaymentsPage);
