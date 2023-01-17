import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Onfido from '../../components/Onfido';
import ONYXKEYS from '../../ONYXKEYS';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import * as Wallet from '../../libs/actions/Wallet';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import Growl from '../../libs/Growl';
import OnfidoPrivacy from './OnfidoPrivacy';
import walletAdditionalDetailsDraftPropTypes from './walletAdditionalDetailsDraftPropTypes';
import walletOnfidoDataPropTypes from './walletOnfidoDataPropTypes';
import FullPageOfflineBlockingView from '../../components/BlockingViews/FullPageOfflineBlockingView';

const propTypes = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: walletOnfidoDataPropTypes,

    /** Stores the personal details typed by the user */
    walletAdditionalDetailsDraft: walletAdditionalDetailsDraftPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletOnfidoData: {
        loading: false,
        hasAcceptedPrivacyPolicy: false,
    },
};

class OnfidoStep extends React.Component {
    componentDidMount() {
        // Once in Onfido step, if we somehow don't have the personal info, go back to previous step, as we need them for Onfido{
        const firstName = lodashGet(this.props, 'walletAdditionalDetailsDraft.legalFirstName');
        const lastName = lodashGet(this.props, 'walletAdditionalDetailsDraft.legalLastName');
        const dob = lodashGet(this.props, 'walletAdditionalDetailsDraft.dob');

        if (!firstName || !lastName || !dob) {
            Wallet.updateCurrentStep(CONST.WALLET.STEP.ADDITIONAL_DETAILS);
        }
    }

    /**
     * @returns {boolean|*}
     */
    canShowOnfido() {
        return this.props.walletOnfidoData.hasAcceptedPrivacyPolicy
            && !this.props.walletOnfidoData.isLoading
            && !this.props.walletOnfidoData.error
            && this.props.walletOnfidoData.sdkToken;
    }

    render() {
        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('onfidoStep.verifyIdentity')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                    shouldShowBackButton
                    onBackButtonPress={() => Wallet.updateCurrentStep(CONST.WALLET.STEP.ADDITIONAL_DETAILS)}
                />
                <FullPageOfflineBlockingView>
                    {
                        this.canShowOnfido() ? (
                            <Onfido
                                sdkToken={this.props.walletOnfidoData.sdkToken}
                                onError={() => {
                                    Growl.error(this.props.translate('onfidoStep.genericError'), 10000);
                                }}
                                onUserExit={() => {
                                    Navigation.goBack();
                                }}
                                onSuccess={(data) => {
                                    BankAccounts.verifyIdentity({
                                        onfidoData: JSON.stringify({
                                            ...data,
                                            applicantID: this.props.walletOnfidoData.applicantID,
                                        }),
                                    });
                                }}
                            />
                        ) : (
                            <OnfidoPrivacy walletOnfidoData={this.props.walletOnfidoData} walletAdditionalDetailsDraft={this.props.walletAdditionalDetailsDraft} />
                        )
                    }
                </FullPageOfflineBlockingView>

            </>
        );
    }
}

OnfidoStep.propTypes = propTypes;
OnfidoStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        walletOnfidoData: {
            key: ONYXKEYS.WALLET_ONFIDO,

            // Let's get a new onfido token each time the user hits this flow (as it should only be once)
            initWithStoredValues: false,
        },
    }),
)(OnfidoStep);
