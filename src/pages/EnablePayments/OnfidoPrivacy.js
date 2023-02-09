import React from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../ONYXKEYS';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import Text from '../../components/Text';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import FormScrollView from '../../components/FormScrollView';
import walletOnfidoDataPropTypes from './walletOnfidoDataPropTypes';
import * as ErrorUtils from '../../libs/ErrorUtils';

const propTypes = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: walletOnfidoDataPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletOnfidoData: {
        applicantID: '',
        sdkToken: '',
        loading: false,
        errors: {},
        fixableErrors: [],
        hasAcceptedPrivacyPolicy: false,
    },
};

class OnfidoPrivacy extends React.Component {
    constructor(props) {
        super(props);

        this.openOnfidoFlow = this.openOnfidoFlow.bind(this);
    }

    openOnfidoFlow() {
        BankAccounts.openOnfidoFlow();
    }

    render() {
        let onfidoError = ErrorUtils.getLatestErrorMessage(this.props.walletOnfidoData) || '';
        const onfidoFixableErrors = lodashGet(this.props, 'walletOnfidoData.fixableErrors', []);
        onfidoError += !_.isEmpty(onfidoFixableErrors) ? `\n${onfidoFixableErrors.join('\n')}` : '';

        return (
            <View style={[styles.mb5, styles.flex1, styles.justifyContentBetween]}>
                {!this.props.walletOnfidoData.hasAcceptedPrivacyPolicy ? (
                    <FormScrollView ref={el => this.form = el}>
                        <View style={[styles.mh5, styles.justifyContentCenter]}>
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
                                    {this.props.translate('common.privacy')}
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
                        <FormAlertWithSubmitButton
                            isAlertVisible={Boolean(onfidoError)}
                            onSubmit={this.openOnfidoFlow}
                            onFixTheErrorsLinkPressed={() => {
                                this.form.scrollTo({y: 0, animated: true});
                            }}
                            message={onfidoError}
                            isLoading={this.props.walletOnfidoData.isLoading}
                            buttonText={onfidoError ? this.props.translate('onfidoStep.tryAgain') : this.props.translate('common.continue')}
                        />
                    </FormScrollView>
                ) : null}
                {this.props.walletOnfidoData.hasAcceptedPrivacyPolicy && this.props.walletOnfidoData.isLoading ? <FullscreenLoadingIndicator /> : null}
            </View>
        );
    }
}

OnfidoPrivacy.propTypes = propTypes;
OnfidoPrivacy.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        walletOnfidoData: {
            key: ONYXKEYS.WALLET_ONFIDO,

            // Let's get a new onfido token each time the user hits this flow (as it should only be once)
            initWithStoredValues: false,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(OnfidoPrivacy);
