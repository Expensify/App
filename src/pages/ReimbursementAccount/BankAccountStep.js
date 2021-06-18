import _ from 'underscore';
import React from 'react';
import {View, Image} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import {Paycheck, Bank, Lock} from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import exampleCheckImage from '../../../assets/images/example-check-image.png';
import Text from '../../components/Text';
import {setupWithdrawalAccount} from '../../libs/actions/BankAccounts';

const propTypes = {
    ...withLocalizePropTypes,
};

class BankAccountStep extends React.Component {
    constructor(props) {
        super(props);

        this.toggleTerms = this.toggleTerms.bind(this);
        this.addManualAccount = this.addManualAccount.bind(this);
        this.addPlaidAccount = this.addPlaidAccount.bind(this);
        this.state = {
            // One of CONST.BANK_ACCOUNT.SETUP_TYPE
            bankAccountAddMethod: props.achData.subStep || undefined,
            hasAcceptedTerms: props.achData.acceptTerms || true,
            routingNumber: props.achData.routingNumber || '',
            accountNumber: props.achData.accountNumber || '',
        };
    }

    toggleTerms() {
        this.setState(prevState => ({
            hasAcceptedTerms: !prevState.hasAcceptedTerms,
        }));
    }

    /**
     * @returns {Boolean}
     */
    canSubmitManually() {
        return this.state.hasAcceptedTerms

            // These are taken from BankCountry.js in Web-Secure
            && CONST.BANK_ACCOUNT.REGEX.IBAN.test(this.state.accountNumber.trim())
            && CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(this.state.routingNumber.trim());
    }

    addManualAccount() {
        setupWithdrawalAccount({
            acceptTerms: this.state.hasAcceptedTerms,
            accountNumber: this.state.accountNumber,
            routingNumber: this.state.routingNumber,
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,

            // Note: These are hardcoded as we're not supporting AU bank accounts for the free plan
            country: CONST.COUNTRY.US,
            currency: CONST.CURRENCY.USD,
            fieldsType: CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL,
        });
    }

    /**
     * @param {Object} params
     * @param {String} params.password
     * @param {Object} params.account
     * @param {String} params.account.bankName
     * @param {Boolean} params.account.isSavings
     * @param {String} params.account.addressName
     * @param {String} params.account.ownershipType
     * @param {String} params.account.accountNumber
     * @param {String} params.account.routingNumber
     * @param {String} params.account.plaidAccountID
     */
    addPlaidAccount(params) {
        setupWithdrawalAccount({
            acceptTerms: true,
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,

            // Params passed via the Plaid callback when an account is selected
            password: params.password,
            plaidAccessToken: params.plaidLinkToken,
            accountNumber: params.account.accountNumber,
            routingNumber: params.account.routingNumber,
            plaidAccountID: params.account.plaidAccountID,
            ownershipType: params.account.ownershipType,
            isSavings: params.account.isSavings,
            bankName: params.account.bankName,
            addressName: params.account.addressName,

            // Note: These are hardcoded as we're not supporting AU bank accounts for the free plan
            country: CONST.COUNTRY.US,
            currency: CONST.CURRENCY.USD,
            fieldsType: CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL,
        });
    }

    render() {
        // Disable bank account fields once they've been added in db so they can't be changed
        const isFromPlaid = this.props.achData.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
        const shouldDisableInputs = Boolean(this.props.achData.bankAccountID) || isFromPlaid;
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={this.props.translate('bankAccount.addBankAccount')}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={() => this.setState({bankAccountAddMethod: undefined})}
                    shouldShowBackButton={!_.isUndefined(this.state.bankAccountAddMethod)}
                />
                {!this.state.bankAccountAddMethod && (
                    <>
                        <View style={[styles.flex1]}>
                            <Text style={[styles.mh5, styles.mb5]}>
                                {this.props.translate('bankAccount.toGetStarted')}
                            </Text>
                            {!this.props.isPlaidDisabled && (
                                <MenuItem
                                    icon={Bank}
                                    title={this.props.translate('bankAccount.logIntoYourBank')}
                                    onPress={() => {
                                        this.setState({bankAccountAddMethod: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID});
                                    }}
                                    shouldShowRightIcon
                                />
                            )}
                            <MenuItem
                                icon={Paycheck}
                                title={this.props.translate('bankAccount.connectManually')}
                                onPress={() => {
                                    this.setState({bankAccountAddMethod: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL});
                                }}
                                shouldShowRightIcon
                            />
                            <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                                <TextLink href="https://use.expensify.com/privacy">
                                    {this.props.translate('common.privacy')}
                                </TextLink>
                                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                    <TextLink
                                        // eslint-disable-next-line max-len
                                        href="https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/"
                                    >
                                        {this.props.translate('bankAccount.yourDataIsSecure')}
                                    </TextLink>
                                    <View style={[styles.ml1]}>
                                        <Icon src={Lock} fill={colors.blue} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}
                {this.state.bankAccountAddMethod === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID && (
                    <AddPlaidBankAccount
                        text={this.props.translate('bankAccount.plaidBodyCopy')}
                        onSubmit={this.addPlaidAccount}
                        onExitPlaid={() => {
                            this.setState({bankAccountAddMethod: undefined});
                        }}
                    />
                )}
                {this.state.bankAccountAddMethod === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL && (
                    <>
                        <View style={[styles.m5, styles.flex1]}>
                            <Text style={[styles.mb5]}>
                                {this.props.translate('bankAccount.checkHelpLine')}
                            </Text>
                            <Image
                                resizeMode="contain"
                                style={[styles.exampleCheckImage, styles.mb5]}
                                source={exampleCheckImage}
                            />
                            <TextInputWithLabel
                                placeholder={this.props.translate('bankAccount.routingNumber')}
                                keyboardType="number-pad"
                                value={this.state.routingNumber}
                                onChangeText={routingNumber => this.setState({routingNumber})}
                                disabled={shouldDisableInputs}
                            />
                            <TextInputWithLabel
                                placeholder={this.props.translate('bankAccount.accountNumber')}
                                keyboardType="number-pad"
                                value={this.state.accountNumber}
                                onChangeText={accountNumber => this.setState({accountNumber})}
                                disabled={shouldDisableInputs}
                            />
                            <CheckboxWithLabel
                                style={[styles.mb4, styles.mt5]}
                                isChecked={this.state.hasAcceptedTerms}
                                onPress={this.toggleTerms}
                                LabelComponent={() => (
                                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        <Text>
                                            {this.props.translate('common.iAcceptThe')}
                                        </Text>
                                        <TextLink href="https://use.expensify.com/terms">
                                            {`Expensify ${this.props.translate('common.termsOfService')}`}
                                        </TextLink>
                                    </View>
                                )}
                            />
                        </View>
                        <Button
                            success
                            text={this.props.translate('common.saveAndContinue')}
                            style={[styles.m5]}
                            isDisabled={!this.canSubmitManually()}
                            onPress={this.addManualAccount}
                        />
                    </>
                )}
            </View>
        );
    }
}

BankAccountStep.propTypes = propTypes;

export default withLocalize(BankAccountStep);
