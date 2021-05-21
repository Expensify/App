import React from 'react';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Onfido from '../../components/Onfido';
import FullscreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../ONYXKEYS';
import {activateWallet, fetchOnfidoToken} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import Button from '../../components/Button';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';

const propTypes = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: PropTypes.shape({

        /** Unique identifier returned from fetchOnfidoToken then re-sent to ActivateWallet with Onfido response data */
        applicantID: PropTypes.string,

        /** Token used to initialize the Onfido SDK token */
        sdkToken: PropTypes.string,

        /** Loading state to provide feedback when we are waiting for a request to finish */
        loading: PropTypes.bool,

        /** Error message to inform the user of any problem that might occur */
        error: PropTypes.string,

        /** Whether the user has accepted the privacy policy of Onfido or not */
        hasAcceptedPrivacyPolicy: PropTypes.bool,
    }),
};

const defaultProps = {
    walletOnfidoData: {
        loading: false,
        hasAcceptedPrivacyPolicy: false,
    },
};

class OnfidoStep extends React.Component {
    canShowOnfido() {
        return this.props.walletOnfidoData.hasAcceptedPrivacyPolicy
            && !this.props.walletOnfidoData.loading
            && !this.props.walletOnfidoData.error
            && this.props.walletOnfidoData.sdkToken;
    }

    render() {
        return (
            <>
                <HeaderWithCloseButton
                    title="Verify Identity"
                    onCloseButtonPress={() => Navigation.goBack()}
                />
                {
                    this.canShowOnfido() ? (
                        <Onfido
                            sdkToken={this.props.walletOnfidoData.sdkToken}
                            onUserExit={() => {
                                Navigation.goBack();
                            }}
                            onSuccess={(data) => {
                                activateWallet(CONST.WALLET.STEP.ONFIDO, {
                                    onfidoData: JSON.stringify({
                                        ...data,
                                        applicantID: this.props.walletOnfidoData.applicantID,
                                    }),
                                });
                            }}
                        />
                    ) : (
                        <View style={[styles.mh5, styles.mb5]}>
                            {!this.props.walletOnfidoData.hasAcceptedPrivacyPolicy && (
                                <>
                                    <Text style={[styles.mb5]}>
                                        {'By continuing with the request to activate this Expensify wallet, you confirm that you have read, understand and accept '}
                                        <TextLink
                                            href="https://onfido.com/facial-scan-policy-and-release/"
                                        >
                                            Onfido’s Facial Scan Policy and Release
                                        </TextLink>
                                        {', '}
                                        <TextLink
                                            href="https://onfido.com/privacy/"
                                        >
                                            Privacy Policy
                                        </TextLink>
                                        {' and '}
                                        <TextLink
                                            href="https://onfido.com/terms-of-service/"
                                        >
                                            Terms of Service
                                        </TextLink>
                                        .
                                    </Text>
                                    <Button
                                        success
                                        text="Agree & Continue"
                                        isLoading={this.props.walletOnfidoData.loading}
                                        onPress={() => {
                                            fetchOnfidoToken();
                                        }}
                                    />
                                </>
                            )}
                            {this.props.walletOnfidoData.hasAcceptedPrivacyPolicy
                                && this.props.walletOnfidoData.loading && <FullscreenLoadingIndicator />}
                            {!this.props.walletOnfidoData.loading && this.props.walletOnfidoData.error && (
                                <>
                                    <Text style={[styles.h3, styles.mb2]}>
                                        {this.props.walletOnfidoData.error}
                                    </Text>
                                    <Button
                                        success
                                        text="Try again"
                                        onPress={() => {
                                            // Restart the flow so the user can try again.
                                            fetchOnfidoToken();
                                        }}
                                    />
                                </>
                            )}
                        </View>
                    )
                }
            </>
        );
    }
}

OnfidoStep.propTypes = propTypes;
OnfidoStep.defaultProps = defaultProps;

export default withOnyx({
    walletOnfidoData: {
        key: ONYXKEYS.WALLET_ONFIDO,

        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(OnfidoStep);
