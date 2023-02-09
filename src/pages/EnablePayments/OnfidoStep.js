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
import walletOnfidoDataPropTypes from './walletOnfidoDataPropTypes';
import FullPageOfflineBlockingView from '../../components/BlockingViews/FullPageOfflineBlockingView';

const propTypes = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: walletOnfidoDataPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletOnfidoData: {
        loading: false,
        hasAcceptedPrivacyPolicy: false,
    },
};

class OnfidoStep extends React.Component {

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
                            <OnfidoPrivacy walletOnfidoData={this.props.walletOnfidoData} />
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
