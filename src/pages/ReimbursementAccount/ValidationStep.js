import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {
    validateBankAccount, updateReimbursementAccountDraft, setBankAccountFormValidationErrors, showBankAccountErrorModal,
} from '../../libs/actions/BankAccounts';
import {navigateToConciergeChat} from '../../libs/actions/Report';
import Button from '../../components/Button';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import Text from '../../components/Text';
import BankAccount from '../../libs/models/BankAccount';
import TextLink from '../../components/TextLink';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import {getDefaultStateForField} from '../../libs/ReimbursementAccountUtils';
import {isRequiredFulfilled} from '../../libs/ValidationUtils';

const propTypes = {
    ...withLocalizePropTypes,

    /** Bank account currently in setup */
    reimbursementAccount: PropTypes.shape({
        /** Object containing various errors */
        errors: PropTypes.objectOf(PropTypes.bool),

        /** Whether we have reached the maximum attempts */
        maxAttemptsReached: PropTypes.bool,

        /** Additional data for the account in setup */
        achData: PropTypes.shape({

            /** Bank account ID of the VBA that we are validating is required */
            bankAccountID: PropTypes.number.isRequired,

            /** State of bank account */
            state: PropTypes.string,
        }).isRequired,
    }),
};

const defaultProps = {
    reimbursementAccount: {
        errors: {},
        maxAttemptsReached: false,
    },
};

class ValidationStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            amount1: getDefaultStateForField(props, 'amount1', ''),
            amount2: getDefaultStateForField(props, 'amount2', ''),
            amount3: getDefaultStateForField(props, 'amount3', ''),
        };

        this.requiredFields = [
            'amount1',
            'amount2',
            'amount3',
        ];

        this.errorTranslationKeys = {
            amount1: 'common.error.invalidAmount',
            amount2: 'common.error.invalidAmount',
            amount3: 'common.error.invalidAmount',
        };
    }

    /**
     * @returns {Object}
     */
    getErrors() {
        return lodashGet(this.props, ['reimbursementAccount', 'errors'], {});
    }

    /**
     * @param {String} inputKey
     * @returns {String}
     */
    getErrorText(inputKey) {
        const errors = this.getErrors();
        return errors[inputKey] ? this.props.translate(this.errorTranslationKeys[inputKey]) : '';
    }

    /**
    * @param {Object} value
    */
    setValue(value) {
        updateReimbursementAccountDraft(value);
        this.setState(value);
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        this.setValue({[inputKey]: value});
        const errors = this.getErrors();
        if (!errors[inputKey]) {
            // No error found for this inputKey
            return;
        }

        // Clear the existing error for this inputKey
        const newErrors = {...errors};
        delete newErrors[inputKey];
        setBankAccountFormValidationErrors(newErrors);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};
        const values = {
            amount1: this.filterInput(this.state.amount1),
            amount2: this.filterInput(this.state.amount2),
            amount3: this.filterInput(this.state.amount3),
        };

        _.each(this.requiredFields, (inputKey) => {
            if (!isRequiredFulfilled(values[inputKey])) {
                errors[inputKey] = true;
            }
        });
        setBankAccountFormValidationErrors(errors);
        return _.size(errors) === 0;
    }

    submit() {
        if (!this.validate()) {
            showBankAccountErrorModal();
            return;
        }

        const amount1 = this.filterInput(this.state.amount1);
        const amount2 = this.filterInput(this.state.amount2);
        const amount3 = this.filterInput(this.state.amount3);

        const validateCode = [amount1, amount2, amount3].join(',');

        // Send valid amounts to BankAccountAPI::validateBankAccount in Web-Expensify
        const bankaccountID = lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID');
        validateBankAccount(bankaccountID, validateCode);
    }

    /**
     * Filter input for validation amount
     * Anything that isn't a number is returned as an empty string
     * Any dollar amount (e.g. 1.12) will be returned as 112
     *
     * @param {String} amount field input
     *
     * @returns {String}
     */
    filterInput(amount) {
        let value = amount.trim();
        if (value === '' || !Math.abs(Str.fromUSDToNumber(value)) || _.isNaN(Number(value))) {
            return '';
        }

        // If the user enters the values in dollars, convert it to the respective cents amount
        if (_.contains(value, '.')) {
            value = Str.fromUSDToNumber(value);
        }

        return value;
    }

    render() {
        const state = lodashGet(this.props, 'reimbursementAccount.achData.state');
        const maxAttemptsReached = lodashGet(this.props, 'reimbursementAccount.maxAttemptsReached');
        const shouldDisableSubmitButton = this.requiredFields
            .reduce((acc, curr) => acc || !this.state[curr].trim(), false) || maxAttemptsReached;

        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={this.props.translate('validationStep.headerTitle')}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {state === BankAccount.STATE.PENDING && (
                    <ScrollView style={[styles.flex1, styles.w100]} contentContainerStyle={[styles.mt2, styles.flexGrow1]}>
                        <View style={[styles.mb2]}>
                            <Text style={[styles.mh5, styles.mb5]}>
                                {this.props.translate('validationStep.description')}
                            </Text>
                            <Text style={[styles.mh5, styles.mb2]}>
                                {this.props.translate('validationStep.descriptionCTA')}
                            </Text>
                        </View>
                        <View style={[styles.m5]}>
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.52"
                                keyboardType="number-pad"
                                value={this.state.amount1}
                                onChangeText={amount1 => this.clearErrorAndSetValue('amount1', amount1)}
                                errorText={this.getErrorText('amount1')}
                            />
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.53"
                                keyboardType="number-pad"
                                value={this.state.amount2}
                                onChangeText={amount2 => this.clearErrorAndSetValue('amount2', amount2)}
                                errorText={this.getErrorText('amount2')}
                            />
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.54"
                                keyboardType="number-pad"
                                value={this.state.amount3}
                                onChangeText={amount3 => this.clearErrorAndSetValue('amount3', amount3)}
                                errorText={this.getErrorText('amount3')}
                            />
                            {maxAttemptsReached && (
                                <Text style={[styles.mb5, styles.mt2, styles.textDanger]}>
                                    {this.props.translate('validationStep.maxAttemptsReached')}
                                </Text>
                            )}
                        </View>
                        <View style={[styles.flex1, styles.justifyContentEnd]}>
                            <Button
                                success
                                text={this.props.translate('validationStep.buttonText')}
                                style={[styles.mh5, styles.mb5]}
                                onPress={this.submit}
                                isDisabled={shouldDisableSubmitButton}
                            />
                        </View>
                    </ScrollView>
                )}
                {state === BankAccount.STATE.VERIFYING && (
                    <View style={[styles.flex1]}>
                        <Text style={[styles.mh5, styles.mb5, styles.flex1]}>
                            {this.props.translate('validationStep.reviewingInfo')}
                            <TextLink
                                onPress={() => {
                                    // There are two modals that must be dismissed before we can reveal the Concierge
                                    // chat underneath these screens
                                    Navigation.dismissModal();
                                    Navigation.dismissModal();
                                    navigateToConciergeChat();
                                }}
                            >
                                {this.props.translate('common.here')}
                            </TextLink>
                            {this.props.translate('validationStep.forNextSteps')}
                        </Text>
                        <Button
                            success
                            text={this.props.translate('bankAccount.confirmModalConfirmText')}
                            style={[styles.mh5, styles.mb5]}
                            onPress={() => Navigation.dismissModal()}
                        />
                    </View>
                )}
            </View>
        );
    }
}

ValidationStep.propTypes = propTypes;
ValidationStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(ValidationStep);
