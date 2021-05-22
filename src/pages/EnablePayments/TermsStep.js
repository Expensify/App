/* eslint-disable max-len */
import React from 'react';
import {
    View, ScrollView, Text, TouchableOpacity,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Checkbox from '../../components/Checkbox';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import {activateWallet} from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';

const propTypes = {
    ...withLocalizePropTypes,
};

class TermsStep extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasAcceptedDisclosure: false,
            hasAcceptedPrivacyPolicyAndWalletAgreement: false,
        };
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
                    <View style={[styles.flexRow, styles.mb2]}>
                        <Checkbox
                            isChecked={this.state.hasAcceptedDisclosure}
                            onClick={hasAcceptedDisclosure => this.setState({hasAcceptedDisclosure})}
                        />
                        <Text style={[styles.ml2, styles.textP, styles.flex1]}>
                            {`${this.props.translate('termsStep.haveReadAndAgree')} `}
                            <TouchableOpacity
                                onPress={() => {
                                    // @TODO link to disclosures
                                }}
                            >
                                <Text style={styles.link}>{`${this.props.translate('termsStep.electronicDisclosures')}.`}</Text>
                            </TouchableOpacity>
                        </Text>
                    </View>
                    <View style={[styles.flexRow, styles.mb2]}>
                        <Checkbox
                            isChecked={this.state.hasAcceptedPrivacyPolicyAndWalletAgreement}
                            onClick={hasAcceptedPrivacyPolicyAndWalletAgreement => (
                                this.setState({hasAcceptedPrivacyPolicyAndWalletAgreement})
                            )}
                        />
                        <Text style={[styles.ml2, styles.textP, styles.flex1]}>
                            {`${this.props.translate('termsStep.agreeToThe')} `}
                            <TouchableOpacity
                                onPress={() => {
                                    // @TODO link to privacy policy
                                }}
                            >
                                <Text style={styles.link}>{`${this.props.translate('common.privacyPolicy')} `}</Text>
                            </TouchableOpacity>
                            {`${this.props.translate('common.and')} `}
                            <TouchableOpacity
                                onPress={() => {
                                    // @TODO link to wallet agreement
                                }}
                            >
                                <Text style={styles.link}>{`${this.props.translate('termsStep.walletAgreement')}.`}</Text>
                            </TouchableOpacity>

                        </Text>
                    </View>
                    <View style={[styles.mv2]}>
                        <Button
                            success
                            text={this.props.translate('termsStep.enablePayments')}
                            isLoading={false}
                            onPress={() => {
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
export default withLocalize(TermsStep);
