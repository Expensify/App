import _ from 'underscore';
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
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
import Checkbox from '../../components/Checkbox';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';

class BusinessBankAccountNewPage extends React.Component {
    constructor(props) {
        super(props);

        this.toggleTerms = this.toggleTerms.bind(this);
        this.addManualAccount = this.addManualAccount.bind(this);

        this.state = {
            addMethodSelection: undefined,
            hasAcceptedTerms: false,
            routingNumber: undefined,
            accountNumber: undefined,
        };
    }

    toggleTerms() {
        this.setState(prevState => ({
            hasAcceptedTerms: !prevState.hasAcceptedTerms,
        }));
    }

    canSubmitManually() {
        // @TODO add better validation
        return this.state.hasAcceptedTerms
            && this.state.accountNumber
            && this.state.routingNumber;
    }

    addManualAccount() {

    }

    render() {
        if (!Permissions.canUseFreePlan()) {
            // This delay is necessary since the "navigator" object is not yet ready - probably we can move to a
            // 404 at some point, but not necessary right now.
            _.delay(Navigation.dismissModal, 0);
            return null;
        }

        // @TODO - these are duplicated from TermsStep for the KYC flow and the checkboxes there should be refactored
        // into a new component as a follow up.
        const toggleStyles = [
            styles.ml2,
            styles.pr2,
            styles.w100,
            styles.flexRow,
            styles.flexWrap,
            styles.alignItemsCenter,
        ];

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
                                <View style={[styles.flexRow, styles.mb4, styles.mt5]}>
                                    <Checkbox
                                        isChecked={this.state.hasAcceptedTerms}
                                        onClick={this.toggleTerms}
                                    />
                                    <TouchableOpacity
                                        onPress={this.toggleTerms}
                                        style={toggleStyles}
                                    >
                                        <Text>
                                            {'I accept the '}
                                            <TextLink href="https://use.expensify.com/terms">
                                                Expensify Terms of Service
                                            </TextLink>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
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

export default BusinessBankAccountNewPage;
