import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import TextLink from '../../components/TextLink';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import ShortTermsForm from './TermsPage/ShortTermsForm';
import LongTermsForm from './TermsPage/LongTermsForm';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import walletTermsPropTypes from './walletTermsPropTypes';
import * as ErrorUtils from '../../libs/ErrorUtils';

const propTypes = {
    /** Comes from Onyx. Information about the terms for the wallet */
    walletTerms: walletTermsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTerms: {},
};

class TermsStep extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDisclosure = this.toggleDisclosure.bind(this);
        this.togglePrivacyPolicy = this.togglePrivacyPolicy.bind(this);
        this.state = {
            hasAcceptedDisclosure: false,
            hasAcceptedPrivacyPolicyAndWalletAgreement: false,
            error: false,
        };
    }

    clearError() {
        if (!this.state.hasAcceptedDisclosure || !this.state.hasAcceptedPrivacyPolicyAndWalletAgreement) {
            return;
        }

        this.setState({error: false});
    }

    toggleDisclosure() {
        this.setState(prevState => ({hasAcceptedDisclosure: !prevState.hasAcceptedDisclosure}), () => this.clearError());
    }

    togglePrivacyPolicy() {
        this.setState(prevState => ({
            hasAcceptedPrivacyPolicyAndWalletAgreement: !prevState.hasAcceptedPrivacyPolicyAndWalletAgreement,
        }), () => this.clearError());
    }

    render() {
        const errorMessage = this.state.error ? this.props.translate('common.error.acceptedTerms') : (ErrorUtils.getLatestErrorMessage(this.props.walletTerms) || '');
        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('termsStep.headerTitle')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <ScrollView style={styles.flex1} contentContainerStyle={styles.ph5}>
                    <ShortTermsForm />
                    <LongTermsForm />
                    <CheckboxWithLabel
                        style={[styles.mb4, styles.mt4]}
                        isChecked={this.state.hasAcceptedDisclosure}
                        onInputChange={this.toggleDisclosure}
                        LabelComponent={() => (
                            <Text>
                                {`${this.props.translate('termsStep.haveReadAndAgree')}`}
                                <TextLink href="https://use.expensify.com/esignagreement">
                                    {`${this.props.translate('termsStep.electronicDisclosures')}.`}
                                </TextLink>
                            </Text>
                        )}
                    />
                    <CheckboxWithLabel
                        isChecked={this.state.hasAcceptedPrivacyPolicyAndWalletAgreement}
                        onInputChange={this.togglePrivacyPolicy}
                        LabelComponent={() => (
                            <Text>
                                {`${this.props.translate('termsStep.agreeToThe')} `}

                                <TextLink href="https://use.expensify.com/privacy">
                                    {`${this.props.translate('common.privacy')} `}
                                </TextLink>

                                {`${this.props.translate('common.and')} `}

                                <TextLink href="https://use.expensify.com/walletagreement">
                                    {`${this.props.translate('termsStep.walletAgreement')}.`}
                                </TextLink>
                            </Text>
                        )}
                    />
                    <FormAlertWithSubmitButton
                        buttonText={this.props.translate('termsStep.enablePayments')}
                        onSubmit={() => {
                            if (!this.state.hasAcceptedDisclosure
                                || !this.state.hasAcceptedPrivacyPolicyAndWalletAgreement) {
                                this.setState({error: true});
                                return;
                            }

                            this.setState({error: false});
                            BankAccounts.acceptWalletTerms({
                                hasAcceptedTerms: this.state.hasAcceptedDisclosure
                                    && this.state.hasAcceptedPrivacyPolicyAndWalletAgreement,
                                chatReportID: this.props.walletTerms.chatReportID,
                            });
                        }}
                        message={errorMessage}
                        isAlertVisible={this.state.error || Boolean(errorMessage)}
                        containerStyles={[styles.mh0, styles.mv4]}
                    />
                </ScrollView>
            </>
        );
    }
}

TermsStep.propTypes = propTypes;
TermsStep.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(TermsStep);
