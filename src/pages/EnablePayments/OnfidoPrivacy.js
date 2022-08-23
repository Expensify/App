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
import walletAdditionalDetailsDraftPropTypes from './walletAdditionalDetailsDraftPropTypes';
import walletOnfidoDataPropTypes from './walletOnfidoDataPropTypes';

const propTypes = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: walletOnfidoDataPropTypes,

    /** Stores the personal details typed by the user */
    walletAdditionalDetailsDraft: walletAdditionalDetailsDraftPropTypes.isRequired,

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

        this.fetchOnfidoToken = this.fetchOnfidoToken.bind(this);
    }

    fetchOnfidoToken() {
        BankAccounts.fetchOnfidoToken(
            this.props.walletAdditionalDetailsDraft.legalFirstName,
            this.props.walletAdditionalDetailsDraft.legalLastName,
            this.props.walletAdditionalDetailsDraft.dob,
        );
    }

    render() {
        const errors = lodashGet(this.props, 'walletOnfidoData.errors', {});
        let onfidoError = _.isEmpty(errors) ? '' : _.last(_.values(errors));
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
                        <FormAlertWithSubmitButton
                            isAlertVisible={Boolean(onfidoError)}
                            onSubmit={this.fetchOnfidoToken}
                            onFixTheErrorsLinkPressed={() => {
                                this.form.scrollTo({y: 0, animated: true});
                            }}
                            message={onfidoError}
                            isLoading={this.props.walletOnfidoData.loading}
                            buttonText={onfidoError ? this.props.translate('onfidoStep.tryAgain') : this.props.translate('common.continue')}
                        />
                    </FormScrollView>
                ) : null}
                {this.props.walletOnfidoData.hasAcceptedPrivacyPolicy && this.props.walletOnfidoData.loading ? <FullscreenLoadingIndicator /> : null}
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
