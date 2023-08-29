import lodashGet from 'lodash/get';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import * as Report from '../../libs/actions/Report';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import BankAccount from '../../libs/models/BankAccount';
import TextLink from '../../components/TextLink';
import ONYXKEYS from '../../ONYXKEYS';
import * as ValidationUtils from '../../libs/ValidationUtils';
import EnableStep from './EnableStep';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';
import Form from '../../components/Form';
import * as Expensicons from '../../components/Icon/Expensicons';
import * as Illustrations from '../../components/Icon/Illustrations';
import Section from '../../components/Section';
import CONST from '../../CONST';
import Button from '../../components/Button';
import MenuItem from '../../components/MenuItem';
import WorkspaceResetBankAccountModal from '../workspace/WorkspaceResetBankAccountModal';
import Enable2FAPrompt from './Enable2FAPrompt';
import ScreenWrapper from '../../components/ScreenWrapper';

const propTypes = {
    ...withLocalizePropTypes,

    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    onBackButtonPress: PropTypes.func.isRequired,

    /** User's account who is setting up bank account */
    account: PropTypes.shape({
        /** If user has two-factor authentication enabled */
        requiresTwoFactorAuth: PropTypes.bool,
    }),
};

const defaultProps = {
    account: {
        requiresTwoFactorAuth: false,
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
     * @returns {Object}
     */
    validate(values) {
        const errors = {};

        _.each(values, (value, key) => {
            const filteredValue = typeof value === 'string' ? this.filterInput(value) : value;
            if (ValidationUtils.isRequiredFulfilled(filteredValue)) {
                return;
            }
            errors[key] = 'common.error.invalidAmount';
        });

        return errors;
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    submit(values) {
        const amount1 = this.filterInput(values.amount1);
        const amount2 = this.filterInput(values.amount2);
        const amount3 = this.filterInput(values.amount3);

        const validateCode = [amount1, amount2, amount3].join(',');

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
        let value = amount ? amount.toString().trim() : '';
        if (value === '' || _.isNaN(Number(value)) || !Math.abs(Str.fromUSDToNumber(value))) {
            return '';
        }

        // If the user enters the values in dollars, convert it to the respective cents amount
        if (_.contains(value, '.')) {
            value = Str.fromUSDToNumber(value);
        }

        return value;
    }

    render() {
        const state = lodashGet(this.props.reimbursementAccount, 'achData.state');

        // If a user tries to navigate directly to the validate page we'll show them the EnableStep
        if (state === BankAccount.STATE.OPEN) {
            return <EnableStep />;
        }

        const maxAttemptsReached = lodashGet(this.props.reimbursementAccount, 'maxAttemptsReached');
        const isVerifying = !maxAttemptsReached && state === BankAccount.STATE.VERIFYING;
        const requiresTwoFactorAuth = lodashGet(this.props, 'account.requiresTwoFactorAuth');

        return (
            <ScreenWrapper
                style={[styles.flex1, styles.justifyContentBetween]}
                includeSafeAreaPaddingBottom={false}
            >
                <HeaderWithBackButton
                    title={isVerifying ? this.props.translate('validationStep.headerTitle') : this.props.translate('workspace.common.testTransactions')}
                    stepCounter={isVerifying ? undefined : {step: 5, total: 5}}
                    onBackButtonPress={this.props.onBackButtonPress}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                />
                {maxAttemptsReached && (
                    <View style={[styles.m5, styles.flex1]}>
                        <Text>
                            {this.props.translate('validationStep.maxAttemptsReached')} {this.props.translate('common.please')}{' '}
                            <TextLink onPress={Report.navigateToConciergeChat}>{this.props.translate('common.contactUs')}</TextLink>.
                        </Text>
                    </View>
                )}
                {!maxAttemptsReached && state === BankAccount.STATE.PENDING && (
                    <Form
                        formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                        submitButtonText={this.props.translate('validationStep.buttonText')}
                        onSubmit={this.submit}
                        validate={this.validate}
                        style={[styles.mh5, styles.flexGrow1]}
                    >
                        <View style={[styles.mb2]}>
                            <Text style={[styles.mb5]}>{this.props.translate('validationStep.description')}</Text>
                            <Text style={[styles.mb2]}>{this.props.translate('validationStep.descriptionCTA')}</Text>
                        </View>
                        <View style={[styles.mv5]}>
                            <TextInput
                                inputID="amount1"
                                shouldSaveDraft
                                containerStyles={[styles.mb1]}
                                placeholder="1.52"
                                keyboardType="decimal-pad"
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            />
                            <TextInput
                                inputID="amount2"
                                shouldSaveDraft
                                containerStyles={[styles.mb1]}
                                placeholder="1.53"
                                keyboardType="decimal-pad"
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            />
                            <TextInput
                                shouldSaveDraft
                                inputID="amount3"
                                containerStyles={[styles.mb1]}
                                placeholder="1.54"
                                keyboardType="decimal-pad"
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            />
                        </View>
                        {!requiresTwoFactorAuth && (
                            <View style={[styles.mln5, styles.mrn5]}>
                                <Enable2FAPrompt />
                            </View>
                        )}
                    </Form>
                )}
                {isVerifying && (
                    <ScrollView style={[styles.flex1]}>
                        <Section
                            title={this.props.translate('workspace.bankAccount.letsFinishInChat')}
                            icon={Illustrations.ConciergeBubble}
                        >
                            <Text>{this.props.translate('validationStep.letsChatText')}</Text>
                            <Button
                                text={this.props.translate('validationStep.letsChatCTA')}
                                onPress={Report.navigateToConciergeChat}
                                icon={Expensicons.ChatBubble}
                                style={[styles.mt4]}
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
                                wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                            />
                        </Section>
                        {this.props.reimbursementAccount.shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={this.props.reimbursementAccount} />}
                        {!requiresTwoFactorAuth && <Enable2FAPrompt />}
                    </ScrollView>
                )}
            </ScreenWrapper>
        );
    }
}

ValidationStep.propTypes = propTypes;
ValidationStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(ValidationStep);
