import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import CONST from '../../CONST';
import userWalletPropTypes from './userWalletPropTypes';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

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
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import PropTypes from "prop-types";

const propTypes = {
    /** Information about the network from Onyx */
    network: networkPropTypes.isRequired,


    additionalDetails: PropTypes.shape({
        errorCode: PropTypes.string,
    }),

    /** The user's wallet */
    userWallet: PropTypes.objectOf(userWalletPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},

    additionalDetails: {
        errorCode: '',
    },
};

class EnablePaymentsPage extends React.Component {
    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.network.isOffline || this.props.network.isOffline) {
            return;
        }

        this.fetchData();
    }

    fetchData() {
        BankAccounts.fetchUserWallet();
    }

    render() {
        if (_.isEmpty(this.props.userWallet)) {
            return <FullScreenLoadingIndicator />;
        }

        if (this.props.additionalDetails.errorCode === CONST.WALLET.ERROR.KYC) {
            return (
                <ScreenWrapper style={[styles.flex1]} keyboardAvoidingViewBehavior="height">
                    <HeaderWithCloseButton
                        title={this.props.translate('additionalDetailsStep.headerTitle')}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <FailedKYC />
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
        additionalDetails: {
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
        },
    }),
    withNetwork(),
)(EnablePaymentsPage);
