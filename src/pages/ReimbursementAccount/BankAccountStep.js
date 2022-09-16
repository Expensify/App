import _ from 'underscore';
import React from 'react';
import {View, Image, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import * as Expensicons from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import exampleCheckImage from './exampleCheckImage';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import ReimbursementAccountForm from './ReimbursementAccountForm';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import Section from '../../components/Section';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as Illustrations from '../../components/Icon/Illustrations';
import getPlaidDesktopMessage from '../../libs/getPlaidDesktopMessage';
import CONFIG from '../../CONFIG';
import ROUTES from '../../ROUTES';
import Button from '../../components/Button';
import FormScrollView from '../../components/FormScrollView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';

const propTypes = {
    /** Bank account currently in setup */
    // eslint-disable-next-line react/no-unused-prop-types
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,

    /** Object with various information about the user */
    user: PropTypes.shape({
        /** Is the user account validated? */
        validated: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
    user: {},
};

class BankAccountStep extends React.Component {
    constructor(props) {
        super(props);

        this.toggleTerms = this.toggleTerms.bind(this);
        this.addManualAccount = this.addManualAccount.bind(this);
        this.addPlaidAccount = this.addPlaidAccount.bind(this);
        this.state = {
            selectedPlaidBankAccount: undefined,
            hasAcceptedTerms: ReimbursementAccountUtils.getDefaultStateForField(props, 'acceptTerms', true),
            routingNumber: ReimbursementAccountUtils.getDefaultStateForField(props, 'routingNumber'),
            accountNumber: ReimbursementAccountUtils.getDefaultStateForField(props, 'accountNumber'),
        };

        // Keys in this.errorTranslationKeys are associated to inputs, they are a subset of the keys found in this.state
        this.errorTranslationKeys = {
            routingNumber: 'bankAccount.error.routingNumber',
            accountNumber: 'bankAccount.error.accountNumber',
            hasAcceptedTerms: 'common.error.acceptedTerms',
        };

        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, this.errorTranslationKeys, inputKey);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
    }

    toggleTerms() {
        this.setState((prevState) => {
            const hasAcceptedTerms = !prevState.hasAcceptedTerms;
            BankAccounts.updateReimbursementAccountDraft({acceptTerms: hasAcceptedTerms});
            return {hasAcceptedTerms};
        });
        this.clearError('hasAcceptedTerms');
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};

        if (!CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(this.state.accountNumber.trim())) {
            errors.accountNumber = true;
        }
        if (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(this.state.routingNumber.trim()) || !ValidationUtils.isValidRoutingNumber(this.state.routingNumber.trim())) {
            errors.routingNumber = true;
        }
        if (!this.state.hasAcceptedTerms) {
            errors.hasAcceptedTerms = true;
        }

        BankAccounts.setBankAccountFormValidationErrors(errors);
        return _.size(errors) === 0;
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        const newState = {[inputKey]: value};
        this.setState(newState);
        BankAccounts.updateReimbursementAccountDraft(newState);
        this.clearError(inputKey);
    }

    addManualAccount() {
        if (!this.validate()) {
            return;
        }

        BankAccounts.setupWithdrawalAccount({
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
     * Add the Bank account retrieved via Plaid in db
     */
    addPlaidAccount() {
        const selectedPlaidBankAccount = this.state.selectedPlaidBankAccount;
        if (!this.state.selectedPlaidBankAccount) {
            return;
        }
        BankAccounts.setupWithdrawalAccount({
            acceptTerms: true,
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,

            // Params passed via the Plaid callback when an account is selected
            plaidAccessToken: selectedPlaidBankAccount.plaidAccessToken,
            accountNumber: selectedPlaidBankAccount.accountNumber,
            routingNumber: selectedPlaidBankAccount.routingNumber,
            plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
            ownershipType: selectedPlaidBankAccount.ownershipType,
            isSavings: selectedPlaidBankAccount.isSavings,
            bankName: selectedPlaidBankAccount.bankName,
            addressName: selectedPlaidBankAccount.addressName,
            mask: selectedPlaidBankAccount.mask,

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
        const shouldReinitializePlaidLink = this.props.plaidLinkOAuthToken && this.props.receivedRedirectURI && this.props.achData.subStep !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
        const subStep = shouldReinitializePlaidLink ? CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID : this.props.achData.subStep;
        const plaidDesktopMessage = getPlaidDesktopMessage();
        const bankAccountRoute = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.BANK_ACCOUNT}`;
        const error = lodashGet(this.props, 'reimbursementAccount.error', '');
        const loading = lodashGet(this.props, 'reimbursementAccount.loading', false);
        const validated = lodashGet(this.props, 'user.validated', false);
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.bankAccount')}
                    stepCounter={subStep ? {step: 1, total: 5} : undefined}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={() => {
                        // If we have a subStep then we will remove otherwise we will go back
                        if (subStep) {
                            BankAccounts.setBankAccountSubStep(null);
                            return;
                        }
                        Navigation.goBack();
                    }}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                />
                {!subStep && (
                    <ScrollView style={[styles.flex1]}>
                        <Section
                            icon={Illustrations.BankMouseGreen}
                            title={this.props.translate('workspace.bankAccount.streamlinePayments')}
                        />
                        <Text style={[styles.mh5, styles.mb1]}>
                            {this.props.translate('bankAccount.toGetStarted')}
                        </Text>
                        {plaidDesktopMessage && (
                            <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                                <TextLink href={bankAccountRoute}>
                                    {this.props.translate(plaidDesktopMessage)}
                                </TextLink>
                            </View>
                        )}
                        <Button
                            icon={Expensicons.Bank}
                            text={this.props.translate('bankAccount.connectOnlineWithPlaid')}
                            onPress={() => BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID)}
                            disabled={this.props.isPlaidDisabled || !validated}
                            style={[styles.mt5, styles.buttonCTA]}
                            iconStyles={[styles.buttonCTAIcon]}
                            shouldShowRightIcon
                            success
                            large
                        />
                        {this.props.error && (
                            <Text style={[styles.formError, styles.mh5]}>
                                {this.props.error}
                            </Text>
                        )}
                        <MenuItem
                            icon={Expensicons.Connect}
                            title={this.props.translate('bankAccount.connectManually')}
                            disabled={!validated}
                            onPress={() => BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL)}
                            shouldShowRightIcon
                        />
                        {!validated && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.m4]}>
                                <Text style={[styles.mutedTextLabel, styles.mr4]}>
                                    <Icon src={Expensicons.Exclamation} fill={colors.red} />
                                </Text>
                                <Text style={styles.mutedTextLabel}>
                                    {this.props.translate('bankAccount.validateAccountError')}
                                </Text>
                            </View>
                        )}
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
                                    <Icon src={Expensicons.Lock} fill={colors.blue} />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}
                {subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID && (
                    <FormScrollView>
                        <View style={[styles.mh5, styles.mb5, styles.flex1]}>
                            <AddPlaidBankAccount
                                text={this.props.translate('bankAccount.plaidBodyCopy')}
                                onSelect={(params) => {
                                    this.setState({
                                        selectedPlaidBankAccount: params.selectedPlaidBankAccount,
                                    });
                                }}
                                onExitPlaid={() => BankAccounts.setBankAccountSubStep(null)}
                                receivedRedirectURI={this.props.receivedRedirectURI}
                                plaidLinkOAuthToken={this.props.plaidLinkOAuthToken}
                                allowDebit
                            />
                        </View>
                        {!_.isUndefined(this.state.selectedPlaidBankAccount) && (
                            <FormAlertWithSubmitButton
                                isAlertVisible={Boolean(error)}
                                buttonText={this.props.translate('common.saveAndContinue')}
                                onSubmit={this.addPlaidAccount}
                                message={error}
                                isLoading={loading}
                            />
                        )}
                    </FormScrollView>
                )}
                {subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL && (
                    <ReimbursementAccountForm
                        reimbursementAccount={this.props.reimbursementAccount}
                        onSubmit={this.addManualAccount}
                    >
                        <Text style={[styles.mb5]}>
                            {this.props.translate('bankAccount.checkHelpLine')}
                        </Text>
                        <Image
                            resizeMode="contain"
                            style={[styles.exampleCheckImage, styles.mb5]}
                            source={exampleCheckImage(this.props.preferredLocale)}
                        />
                        <TextInput
                            label={this.props.translate('bankAccount.routingNumber')}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            value={this.state.routingNumber}
                            onChangeText={value => this.clearErrorAndSetValue('routingNumber', value)}
                            disabled={shouldDisableInputs}
                            errorText={this.getErrorText('routingNumber')}
                        />
                        <TextInput
                            containerStyles={[styles.mt4]}
                            label={this.props.translate('bankAccount.accountNumber')}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            value={this.state.accountNumber}
                            onChangeText={value => this.clearErrorAndSetValue('accountNumber', value)}
                            disabled={shouldDisableInputs}
                            errorText={this.getErrorText('accountNumber')}
                        />
                        <CheckboxWithLabel
                            style={styles.mt4}
                            isChecked={this.state.hasAcceptedTerms}
                            onInputChange={this.toggleTerms}
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
                            errorText={this.getErrorText('hasAcceptedTerms')}
                        />
                    </ReimbursementAccountForm>
                )}
            </View>
        );
    }
}

BankAccountStep.propTypes = propTypes;
BankAccountStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(BankAccountStep);
