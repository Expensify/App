import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import ShortTermsForm from './TermsPage/ShortTermsForm';
import LongTermsForm from './TermsPage/LongTermsForm';

const propTypes = {
    /** Comes from Onyx. Information about the terms for the wallet */
    walletTerms: PropTypes.shape({
        /** Whether or not the information is currently loading */
        loading: PropTypes.bool,
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTerms: {
        loading: false,
    },
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
                            <>
                                <Text>
                                    {`${this.props.translate('termsStep.agreeToThe')} `}
                                </Text>

                                <TextLink href="https://use.expensify.com/privacy">
                                    {`${this.props.translate('common.privacyPolicy')} `}
                                </TextLink>

                                <Text>{`${this.props.translate('common.and')} `}</Text>

                                <TextLink href="https://use.expensify.com/walletagreement">
                                    {`${this.props.translate('termsStep.walletAgreement')}.`}
                                </TextLink>
                            </>
                        )}
                    />
                    {this.state.error && (
                        <Text style={[styles.formError, styles.mb2]}>
                            {this.props.translate('common.error.acceptedTerms')}
                        </Text>
                    )}
                    <Button
                        success
                        style={[styles.mv4]}
                        text={this.props.translate('termsStep.enablePayments')}
                        isLoading={this.props.walletTerms.loading}
                        onPress={() => {
                            if (!this.state.hasAcceptedDisclosure
                                || !this.state.hasAcceptedPrivacyPolicyAndWalletAgreement) {
                                this.setState({error: true});
                                return;
                            }

                            this.setState({error: false});
                            BankAccounts.activateWallet(CONST.WALLET.STEP.TERMS, {
                                hasAcceptedTerms: this.state.hasAcceptedDisclosure
                                    && this.state.hasAcceptedPrivacyPolicyAndWalletAgreement,
                            });
                        }}
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
            initWithStoredValues: false,
        },
    }),
)(TermsStep);
