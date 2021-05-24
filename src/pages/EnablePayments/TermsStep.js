/* eslint-disable max-len */
import React from 'react';
import {
    View, ScrollView, Text, TouchableOpacity,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Checkbox from '../../components/Checkbox';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import {activateWallet} from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    walletTerms: PropTypes.shape({
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

    toggleDisclosure() {
        this.setState(prevState => ({hasAcceptedDisclosure: !prevState.hasAcceptedDisclosure}));
    }

    togglePrivacyPolicy() {
        this.setState(prevState => ({hasAcceptedPrivacyPolicyAndWalletAgreement: !prevState.hasAcceptedPrivacyPolicyAndWalletAgreement}));
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('termsStep.headerTitle')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.mh5, styles.flex1]}>
                    <ScrollView>
                        <Text>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </Text>
                    </ScrollView>
                    <View style={[styles.flexRow, styles.mb4]}>
                        <Checkbox
                            isChecked={this.state.hasAcceptedDisclosure}
                            onClick={this.toggleDisclosure}
                        />
                        <TouchableOpacity
                            onPress={this.toggleDisclosure}
                            style={[
                                styles.ml2,
                                styles.flexRow,
                                styles.flexWrap,
                                styles.alignItemsCenter,
                            ]}
                        >
                            <Text>
                                {`${this.props.translate('termsStep.haveReadAndAgree')} `}

                                {/* @TODO add external links */}
                                <TextLink href="">{`${this.props.translate('termsStep.electronicDisclosures')}.`}</TextLink>
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexRow, styles.mb4]}>
                        <Checkbox
                            isChecked={this.state.hasAcceptedPrivacyPolicyAndWalletAgreement}
                            onClick={this.togglePrivacyPolicy}
                        />
                        <TouchableOpacity
                            onPress={this.togglePrivacyPolicy}
                            style={[
                                styles.ml2,
                                styles.flexRow,
                                styles.flexWrap,
                                styles.alignItemsCenter,
                            ]}
                        >
                            <Text>
                                {`${this.props.translate('termsStep.agreeToThe')} `}
                            </Text>

                            {/* @TODO link to privacy policy */}
                            <TextLink href="">
                                {`${this.props.translate('common.privacyPolicy')} `}
                            </TextLink>

                            <Text>{`${this.props.translate('common.and')} `}</Text>

                            {/* @TODO link to wallet agreement */}
                            <TextLink href="">
                                {`${this.props.translate('termsStep.walletAgreement')}.`}
                            </TextLink>
                        </TouchableOpacity>
                    </View>
                    {this.state.error && (
                        <Text style={[styles.formError, styles.mb2]}>
                            {this.props.translate('termsStep.termsMustBeAccepted')}
                        </Text>
                    )}
                    <View style={[styles.mv5]}>
                        <Button
                            success
                            text={this.props.translate('termsStep.enablePayments')}
                            isLoading={this.props.walletTerms.loading}
                            onPress={() => {
                                if (!this.state.hasAcceptedDisclosure || !this.state.hasAcceptedPrivacyPolicyAndWalletAgreement) {
                                    this.setState({error: true});
                                    return;
                                }

                                this.setState({error: false});
                                activateWallet(CONST.WALLET.STEP.TERMS, {
                                    hasAcceptedTerms: this.state.hasAcceptedDisclosure && this.state.hasAcceptedPrivacyPolicyAndWalletAgreement,
                                });
                            }}
                        />
                    </View>
                </View>
            </ScreenWrapper>
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
