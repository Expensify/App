import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View, Image} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import {
    Paycheck, Bank, Lock,
} from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import exampleCheckImage from '../../../assets/images/example-check-image.png';
import Text from '../../components/Text';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import {
    goToWithdrawalAccountSetupStep,
    hideBankAccountErrors,
    setBankAccountFormValidationErrors,
    setupWithdrawalAccount,
    showBankAccountErrorModal,
} from '../../libs/actions/BankAccounts';
import ConfirmModal from '../../components/ConfirmModal';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: PropTypes.shape({
        /** Error set when handling the API response */
        error: PropTypes.string,

        /** The existing owners for if the bank account is already owned */
        existingOwners: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,

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

        this.errorTranslationKeys = {
            routingNumber: 'bankAccount.error.routingNumber',
            accountNumber: 'bankAccount.error.accountNumber',
        };
    }

    getErrors() {
        return lodashGet(this.props, ['reimbursementAccount', 'errors'], {});
    }

    getErrorText(inputKey) {
        const errors = this.getErrors();
        return (errors[inputKey] ? this.props.translate(this.errorTranslationKeys[inputKey])
            : '');
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
            && this.state.accountNumber.trim()
            && this.state.routingNumber.trim();
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};

        // These are taken from BankCountry.js in Web-Secure
        if (!CONST.BANK_ACCOUNT.REGEX.IBAN.test(this.state.accountNumber.trim())) {
            errors.accountNumber = true;
        }
        if (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(this.state.routingNumber.trim())) {
            errors.routingNumber = true;
        }
        setBankAccountFormValidationErrors(errors);
        return _.size(errors) === 0;
    }

    validateAndSetTextValue(inputKey, value) {
        const errors = this.getErrors();
        if (errors[inputKey]) {
            const newErrors = {...errors};
            delete newErrors[inputKey];
            setBankAccountFormValidationErrors(newErrors);
        }
        this.setState({[inputKey]: value});
    }

    addManualAccount() {
        if (!this.validate()) {
            showBankAccountErrorModal();
            return;
        }
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
        const existingOwners = this.props.reimbursementAccount.existingOwners;
        const error = this.props.reimbursementAccount.error;
        const isExistingOwnersErrorVisible = Boolean(error && existingOwners);
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
                            <MenuItem
                                icon={Bank}
                                title={this.props.translate('bankAccount.logIntoYourBank')}
                                onPress={() => {
                                    this.setState({bankAccountAddMethod: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID});
                                }}
                                disabled={this.props.isPlaidDisabled}
                                shouldShowRightIcon
                            />
                            {this.props.isPlaidDisabled && (
                                <Text style={[styles.formError, styles.mh5]}>
                                    {this.props.translate('bankAccount.error.tooManyAttempts')}
                                </Text>
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
                            <ExpensiTextInput
                                placeholder={this.props.translate('bankAccount.routingNumber')}
                                keyboardType="number-pad"
                                value={this.state.routingNumber}
                                onChangeText={value => this.validateAndSetTextValue('routingNumber', value)}
                                disabled={shouldDisableInputs}
                                errorText={this.getErrorText('routingNumber')}
                            />
                            <ExpensiTextInput
                                containerStyles={[styles.mt4]}
                                placeholder={this.props.translate('bankAccount.accountNumber')}
                                keyboardType="number-pad"
                                value={this.state.accountNumber}
                                onChangeText={value => this.validateAndSetTextValue('accountNumber', value)}
                                disabled={shouldDisableInputs}
                                errorText={this.getErrorText('accountNumber')}
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

                <ConfirmModal
                    title={this.props.translate('bankAccount.error.existingOwners.unableToAddBankAccount')}
                    isVisible={isExistingOwnersErrorVisible}
                    onConfirm={hideBankAccountErrors}
                    shouldShowCancelButton={false}
                    prompt={(
                        <View>
                            <Text style={[styles.mb4]}>
                                <Text>
                                    {this.props.translate('bankAccount.error.existingOwners.alreadyInUse')}
                                </Text>
                                {existingOwners && existingOwners.map((existingOwner, i) => {
                                    let separator = ', ';
                                    if (i === 0) {
                                        separator = '';
                                    } else if (i === existingOwners.length - 1) {
                                        separator = ` ${this.props.translate('common.and')} `;
                                    }
                                    return (
                                        <>
                                            <Text>{separator}</Text>
                                            <Text style={styles.textStrong}>{existingOwner}</Text>
                                            {i === existingOwners.length - 1 && <Text>.</Text>}
                                        </>
                                    );
                                })}
                            </Text>
                            <Text style={[styles.mb4]}>
                                {this.props.translate('bankAccount.error.existingOwners.pleaseAskThemToShare')}
                            </Text>
                            <Text>
                                <Text>
                                    {this.props.translate('bankAccount.error.existingOwners.alternatively')}
                                </Text>
                                <Text
                                    style={styles.link}
                                    onPress={() => goToWithdrawalAccountSetupStep(
                                        CONST.BANK_ACCOUNT.STEP.COMPANY,
                                        this.props.achData,
                                    )}
                                >
                                    {this.props.translate(
                                        'bankAccount.error.existingOwners.setUpThisAccountByYourself',
                                    )}
                                </Text>
                                <Text>
                                    {this.props.translate('bankAccount.error.existingOwners.validationProcessAgain')}
                                </Text>
                            </Text>
                        </View>
                    )}
                    confirmText={this.props.translate('common.ok')}
                />
            </View>
        );
    }
}

BankAccountStep.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(BankAccountStep);
