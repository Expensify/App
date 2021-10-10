import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {
    validateBankAccount, updateReimbursementAccountDraft, setBankAccountFormValidationErrors, showBankAccountErrorModal,
} from '../../libs/actions/BankAccounts';
import {navigateToConciergeChat} from '../../libs/actions/Report';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import Text from '../../components/Text';
import BankAccount from '../../libs/models/BankAccount';
import TextLink from '../../components/TextLink';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import {isRequiredFulfilled} from '../../libs/ValidationUtils';
import EnableStep from './EnableStep';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import ReimbursementAccountForm from './ReimbursementAccountForm';
import {ChatBubble} from '../../components/Icon/Expensicons';
import {ConciergeBlue} from '../../components/Icon/Illustrations';
import WorkspaceSection from '../workspace/WorkspaceSection';

const propTypes = {
    ...withLocalizePropTypes,

    /** Bank account currently in setup */
    reimbursementAccount: reimbursementAccountPropTypes,
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
        this.navigateToConcierge = this.navigateToConcierge.bind(this);

        this.state = {
            amount1: ReimbursementAccountUtils.getDefaultStateForField(props, 'amount1', ''),
            amount2: ReimbursementAccountUtils.getDefaultStateForField(props, 'amount2', ''),
            amount3: ReimbursementAccountUtils.getDefaultStateForField(props, 'amount3', ''),
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

        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, this.errorTranslationKeys, inputKey);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
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
        this.clearError(inputKey);
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

    navigateToConcierge() {
        Navigation.dismissModal();
        navigateToConciergeChat();
    }

    render() {
        const state = lodashGet(this.props, 'reimbursementAccount.achData.state');

        // If a user tries to navigate directly to the validate page we'll show them the EnableStep
        if (state === BankAccount.STATE.OPEN) {
            return <EnableStep achData={lodashGet(this.props, 'reimbursementAccount.achData')} />;
        }

        const maxAttemptsReached = lodashGet(this.props, 'reimbursementAccount.maxAttemptsReached');
        const isVerifying = !maxAttemptsReached && state === BankAccount.STATE.VERIFYING;

        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.bankAccount')}
                    stepCounter={{step: 5, total: 5}}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={() => Navigation.goBack()}
                    shouldShowBackButton
                />
                {maxAttemptsReached && (
                    <View style={[styles.m5, styles.flex1]}>
                        <Text>
                            {this.props.translate('validationStep.maxAttemptsReached')}
                            {' '}
                            {this.props.translate('common.please')}
                            {' '}
                            <TextLink onPress={this.navigateToConcierge}>
                                {this.props.translate('common.contactUs')}
                            </TextLink>
                            .
                        </Text>
                    </View>
                )}
                {!maxAttemptsReached && state === BankAccount.STATE.PENDING && (
                    <ReimbursementAccountForm
                        onSubmit={this.submit}
                    >
                        <View style={[styles.mb2]}>
                            <Text style={[styles.mb5]}>
                                {this.props.translate('validationStep.description')}
                            </Text>
                            <Text style={[styles.mb2]}>
                                {this.props.translate('validationStep.descriptionCTA')}
                            </Text>
                        </View>
                        <View style={[styles.mv5, styles.flex1]}>
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.52"
                                keyboardType="decimal-pad"
                                value={this.state.amount1}
                                onChangeText={amount1 => this.clearErrorAndSetValue('amount1', amount1)}
                                errorText={this.getErrorText('amount1')}
                            />
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.53"
                                keyboardType="decimal-pad"
                                value={this.state.amount2}
                                onChangeText={amount2 => this.clearErrorAndSetValue('amount2', amount2)}
                                errorText={this.getErrorText('amount2')}
                            />
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.54"
                                keyboardType="decimal-pad"
                                value={this.state.amount3}
                                onChangeText={amount3 => this.clearErrorAndSetValue('amount3', amount3)}
                                errorText={this.getErrorText('amount3')}
                            />
                        </View>
                    </ReimbursementAccountForm>
                )}
                {isVerifying && (
                    <View style={[styles.flex1]}>
                        <WorkspaceSection
                            title={this.props.translate('workspace.bankAccount.letsFinishInChat')}
                            icon={ConciergeBlue}
                            menuItems={[{
                                title: this.props.translate('validationStep.letsChatCTA'),
                                icon: ChatBubble,
                                onPress: this.navigateToConcierge,
                                shouldShowRightIcon: true,
                            }]}
                        >
                            <Text>
                                {this.props.translate('validationStep.letsChatText')}
                            </Text>
                        </WorkspaceSection>
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
