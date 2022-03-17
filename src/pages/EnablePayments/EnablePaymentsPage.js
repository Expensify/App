import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {KeyboardAvoidingView} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import CONST from '../../CONST';
import * as Wallet from '../../libs/actions/Wallet';
import userWalletPropTypes from './userWalletPropTypes';

// Steps
import OnfidoStep from './OnfidoStep';
import AdditionalDetailsStep from './AdditionalDetailsStep';
import TermsStep from './TermsStep';
import ActivateStep from './ActivateStep';
import styles from '../../styles/styles';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import FailedKYC from './FailedKYC';
import compose from '../../libs/compose';
import withLocalize from '../../components/withLocalize';

const propTypes = {
    ...userWalletPropTypes,
};

const defaultProps = {
    userWallet: {},
};

class EnablePaymentsPage extends React.Component {
    componentDidMount() {
        BankAccounts.fetchUserWallet();

        // Once in Onfido step, if we somehow don't have the personal info, go back to previous step, as we need them for Onfido
        if (this.props.userWallet.currentStep === CONST.WALLET.STEP.ONFIDO) {
            const firstName = lodashGet(this.props, 'walletAdditionalDetailsDraft.legalFirstName');
            const lastName = lodashGet(this.props, 'walletAdditionalDetailsDraft.legalLastName');
            const dob = lodashGet(this.props, 'walletAdditionalDetailsDraft.dob');

            if (!firstName || !lastName || !dob) {
                Wallet.updateCurrentStep(CONST.WALLET.STEP.ADDITIONAL_DETAILS);
                this.currentStep = CONST.WALLET.STEP.ADDITIONAL_DETAILS;
            }
        }
    }

    render() {
        if (_.isEmpty(this.props.userWallet)) {
            return <FullScreenLoadingIndicator />;
        }

        if (this.props.userWallet.shouldShowFailedKYC) {
            return (
                <ScreenWrapper>
                    <KeyboardAvoidingView style={[styles.flex1]} behavior="height">
                        <HeaderWithCloseButton
                            title={this.props.translate('additionalDetailsStep.headerTitle')}
                            onCloseButtonPress={() => Navigation.dismissModal()}
                        />
                        <FailedKYC />
                    </KeyboardAvoidingView>
                </ScreenWrapper>
            );
        }

        const currentStep = this.props.userWallet.currentStep || CONST.WALLET.STEP.ADDITIONAL_DETAILS;

        return (
            <ScreenWrapper>
                {currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS && <AdditionalDetailsStep walletAdditionalDetailsDraft={this.props.walletAdditionalDetailsDraft} />}
                {currentStep === CONST.WALLET.STEP.ONFIDO && <OnfidoStep walletAdditionalDetailsDraft={this.props.walletAdditionalDetailsDraft} />}
                {currentStep === CONST.WALLET.STEP.TERMS && <TermsStep />}
                {currentStep === CONST.WALLET.STEP.ACTIVATE && <ActivateStep userWallet={this.props.userWallet} />}
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
