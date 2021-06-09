import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import {Bug, Lock} from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import Permissions from '../../libs/Permissions';
import CONST from '../../CONST';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import ONYXKEYS from '../../ONYXKEYS';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,
};

class BusinessBankAccountNewPage extends React.Component {
    constructor(props) {
        super(props);

        this.toggleTerms = this.toggleTerms.bind(this);
        this.addManualAccount = this.addManualAccount.bind(this);

        this.state = {
            addMethodSelection: undefined,
            hasAcceptedTerms: false,
            routingNumber: '',
            accountNumber: '',
        };
    }

    toggleTerms() {
        this.setState(prevState => ({
            hasAcceptedTerms: !prevState.hasAcceptedTerms,
        }));
    }

    canSubmitManually() {
        return this.state.hasAcceptedTerms
            && this.state.accountNumber

            // These are taken from BankCountry.js in Web-Secure
            && /^[A-Za-z0-9]{2,30}$/.test(this.state.accountNumber.trim())
            && this.state.routingNumber
            && /^[A-Za-z0-9]{8,11}$/.test(this.state.routingNumber.trim());
    }

    addManualAccount() {
        // @TODO call API to add account manually
    }

    render() {
        if (!Permissions.canUseFreePlan(this.props.betas)) {
            Navigation.dismissModal();
            return null;
        }

        return (
            <ScreenWrapper>
                <View style={[styles.flex1, styles.justifyContentBetween]}>
                    <HeaderWithCloseButton
                        title="Add Bank Account"
                        onCloseButtonPress={Navigation.dismissModal}
                        onBackButtonPress={() => this.setState({addMethodSelection: undefined})}
                        shouldShowBackButton={!_.isUndefined(this.state.addMethodSelection)}
                    />
                    {!this.state.addMethodSelection && (
                        <>
                            <View style={[styles.flex1]}>
                                <Text style={[styles.mh5, styles.mb5]}>
                                    To get started with the Expensify Card, you first need to add a bank account.
                                </Text>
                                <MenuItem
                                    icon={Bug}
                                    title="Log Into Your Bank"
                                    onPress={() => {
                                        this.setState({addMethodSelection: CONST.BANK_ACCOUNT.ADD_METHOD.PLAID});
                                    }}
                                    shouldShowRightIcon
                                />
                                <MenuItem
                                    icon={Bug}
                                    title="Connect Manually"
                                    onPress={() => {
                                        this.setState({addMethodSelection: CONST.BANK_ACCOUNT.ADD_METHOD.MANUAL});
                                    }}
                                    shouldShowRightIcon
                                />
                                <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                                    <TextLink href="https://use.expensify.com/privacy">
                                        Privacy
                                    </TextLink>
                                    <TextLink
                                        // eslint-disable-next-line max-len
                                        href="https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/"
                                        style={[styles.dFlex, styles.justifyContentCenter]}
                                    >
                                        Your data is secure
                                        <View style={[styles.ml1]}>
                                            <Icon src={Lock} fill={colors.blue} />
                                        </View>
                                    </TextLink>
                                </View>
                            </View>
                        </>
                    )}
                    {this.state.addMethodSelection === CONST.BANK_ACCOUNT.ADD_METHOD.PLAID && (
                        <AddPlaidBankAccount
                            text="Give your employees an easier way to pay - and get paid back - for company expenses."
                            onSubmit={(args) => {
                                console.debug(args);
                            }}
                            onExitPlaid={() => {
                                this.setState({addMethodSelection: undefined});
                            }}
                        />
                    )}
                    {this.state.addMethodSelection === CONST.BANK_ACCOUNT.ADD_METHOD.MANUAL && (
                        <>
                            <View style={[styles.m5, styles.flex1]}>
                                <Text style={[styles.mb5]}>
                                    Your routing number and account number can be found on a check for the account.
                                </Text>
                                <TextInputWithLabel
                                    label="Routing Number"
                                    placeholder="9 digits"
                                    keyboardType="numeric"
                                    value={this.state.routingNumber}
                                    onChangeText={routingNumber => this.setState({routingNumber})}
                                />
                                <TextInputWithLabel
                                    label="Account Number"
                                    keyboardType="numeric"
                                    value={this.state.accountNumber}
                                    onChangeText={accountNumber => this.setState({accountNumber})}
                                />
                                <CheckboxWithLabel
                                    style={[styles.mb4, styles.mt5]}
                                    isChecked={this.state.hasAcceptedTerms}
                                    onPress={this.toggleTerms}
                                    LabelComponent={() => (
                                        <Text>
                                            {'I accept the '}
                                            <TextLink href="https://use.expensify.com/terms">
                                                Expensify Terms of Service
                                            </TextLink>
                                        </Text>
                                    )}
                                />
                            </View>
                            <Button
                                success
                                text="Save & Continue"
                                style={[styles.m5]}
                                isDisabled={!this.canSubmitManually()}
                                onPress={this.addManualAccount}
                            />
                        </>
                    )}
                </View>
            </ScreenWrapper>
        );
    }
}

BusinessBankAccountNewPage.propTypes = propTypes;

export default withOnyx({
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(BusinessBankAccountNewPage);
