import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import * as Report from '../../libs/actions/Report';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import BankAccount from '../../libs/models/BankAccount';
import TextLink from '../../components/TextLink';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import EnableStep from './EnableStep';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import Form from '../../components/Form';
import * as Expensicons from '../../components/Icon/Expensicons';
import * as Illustrations from '../../components/Icon/Illustrations';
import Section from '../../components/Section';
import CONST from '../../CONST';
import Button from '../../components/Button';
import MenuItem from '../../components/MenuItem';

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
        this.validate = this.validate.bind(this);
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    validate(values) {
        const errors = {};

        const filteredValues = {
            amount1: this.filterInput(values.amount1),
            amount2: this.filterInput(values.amount2),
            amount3: this.filterInput(values.amount3),
        };

        _.chain(filteredValues).keys().each((inputKey) => {
            if (ValidationUtils.isRequiredFulfilled(filteredValues[inputKey])) {
                return;
            }
            errors[inputKey] = this.props.translate('common.error.invalidAmount');
        });

        return errors;
    }

    submit(values) {
        const validateCode = [values.amount1, values.amount2, values.amount3].join(',');

        // Send valid amounts to BankAccountAPI::validateBankAccount in Web-Expensify
        const bankaccountID = lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID');
        BankAccounts.validateBankAccount(bankaccountID, validateCode);
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

        // If a user tries to navigate directly to the validate page we'll show them the EnableStep
        if (state === BankAccount.STATE.OPEN) {
            return <EnableStep achData={lodashGet(this.props, 'reimbursementAccount.achData')} />;
        }

        const maxAttemptsReached = lodashGet(this.props, 'reimbursementAccount.maxAttemptsReached');
        const isVerifying = !maxAttemptsReached && state === BankAccount.STATE.VERIFYING;

        const currentStep = lodashGet(
            this.props,
            'reimbursementAccount.achData.currentStep',
            CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
        );

        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={isVerifying ? this.props.translate('validationStep.headerTitle') : this.props.translate('workspace.common.testTransactions')}
                    stepCounter={{step: 5, total: 5}}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={() => Navigation.goBack()}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    shouldShowStepCounter={!isVerifying}
                />
                {maxAttemptsReached && (
                    <View style={[styles.m5, styles.flex1]}>
                        <Text>
                            {this.props.translate('validationStep.maxAttemptsReached')}
                            {' '}
                            {this.props.translate('common.please')}
                            {' '}
                            <TextLink onPress={Report.navigateToConciergeChat}>
                                {this.props.translate('common.contactUs')}
                            </TextLink>
                            .
                        </Text>
                    </View>
                )}
                {!maxAttemptsReached && state === BankAccount.STATE.PENDING && (
                    <Form
                        formID={ONYXKEYS.FORMS.VALIDATION_STEP_FORM}
                        submitButtonText={currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION ? this.props.translate('validationStep.buttonText') : this.props.translate('common.saveAndContinue')}
                        onSubmit={this.submit}
                        validate={this.validate}
                        style={[styles.mh5, styles.mb5]}
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
                            <TextInput
                                isFormInput
                                inputID="amount1"
                                shouldSaveDraft
                                defaultValue=""
                                containerStyles={[styles.mb1]}
                                placeholder="1.52"
                                keyboardType="decimal-pad"
                            />
                            <TextInput
                                isFormInput
                                inputID="amount2"
                                shouldSaveDraft
                                defaultValue=""
                                containerStyles={[styles.mb1]}
                                placeholder="1.53"
                                keyboardType="decimal-pad"
                            />
                            <TextInput
                                isFormInput
                                shouldSaveDraft
                                inputID="amount3"
                                defaultValue=""
                                containerStyles={[styles.mb1]}
                                placeholder="1.54"
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </Form>
                )}
                {isVerifying && (
                    <View style={[styles.flex1]}>
                        <Section
                            title={this.props.translate('workspace.bankAccount.letsFinishInChat')}
                            icon={Illustrations.ConciergeBlue}
                        >
                            <Text>
                                {this.props.translate('validationStep.letsChatText')}
                            </Text>
                        </Section>
                        <Button
                            text={this.props.translate('validationStep.letsChatCTA')}
                            onPress={Report.navigateToConciergeChat}
                            icon={Expensicons.ChatBubble}
                            style={[styles.mt4, styles.buttonCTA]}
                            iconStyles={[styles.buttonCTAIcon]}
                            shouldShowRightIcon
                            large
                            success
                        />
                        <MenuItem
                            title={this.props.translate('workspace.bankAccount.noLetsStartOver')}
                            icon={Expensicons.RotateLeft}
                            onPress={BankAccounts.requestResetFreePlanBankAccount}
                            shouldShowRightIcon
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
        validationStepForm: {
            key: ONYXKEYS.FORMS.VALIDATION_STEP_FORM,
        },
    }),
)(ValidationStep);
