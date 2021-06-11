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
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

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
            && !this.props.walletOnfidoData.loading
            && !this.props.walletOnfidoData.error
            && this.props.walletOnfidoData.sdkToken;
    }

    render() {
        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('onfidoStep.verifyIdentity')}
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
                        <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentBetween]}>
                            {!this.props.walletOnfidoData.hasAcceptedPrivacyPolicy && (
                                <>
                                    <View style={styles.justifyContentCenter}>
                                        <Text style={[styles.mb5]}>
                                            {this.props.translate('onfidoStep.acceptTerms')}
                                            <TextLink
                                                href="https://onfido.com/facial-scan-policy-and-release/"
                                            >
                                                {this.props.translate('onfidoStep.facialScan')}
                                            </TextLink>
                                            {', '}
                                            <TextLink
                                                href="https://onfido.com/privacy/"
                                            >
                                                {this.props.translate('common.privacyPolicy')}
                                            </TextLink>
                                            {` ${this.props.translate('common.and')} `}
                                            <TextLink
                                                href="https://onfido.com/terms-of-service/"
                                            >
                                                {this.props.translate('common.termsOfService')}
                                            </TextLink>
                                            .
                                        </Text>
                                    </View>
                                    <Button
                                        success
                                        text={this.props.translate('common.continue')}
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
                                        text={this.props.translate('onfidoStep.tryAgain')}
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
