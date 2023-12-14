import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import BankAccount from '@libs/models/BankAccount';
import * as ValidationUtils from '@libs/ValidationUtils';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Enable2FAPrompt from './Enable2FAPrompt';
import EnableStep from './EnableStep';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';

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

    /** policyID of the workspace where user is setting up bank account */
    policyID: PropTypes.string.isRequired,
};

const defaultProps = {
    account: {
        requiresTwoFactorAuth: false,
    },
};

/**
 * Filter input for validation amount
 * Anything that isn't a number is returned as an empty string
 * Any dollar amount (e.g. 1.12) will be returned as 112
 *
 * @param {String} amount field input
 * @returns {String}
 */
const filterInput = (amount) => {
    let value = amount ? amount.toString().trim() : '';
    if (value === '' || _.isNaN(Number(value)) || !Math.abs(Str.fromUSDToNumber(value))) {
        return '';
    }

    // If the user enters the values in dollars, convert it to the respective cents amount
    if (_.contains(value, '.')) {
        value = Str.fromUSDToNumber(value);
    }

    return value;
};

function ValidationStep({reimbursementAccount, translate, onBackButtonPress, account, policyID}) {
    const styles = useThemeStyles();
    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object}
     */
    const validate = (values) => {
        const errors = {};

        _.each(values, (value, key) => {
            const filteredValue = typeof value === 'string' ? filterInput(value) : value;
            if (ValidationUtils.isRequiredFulfilled(filteredValue)) {
                return;
            }
            errors[key] = 'common.error.invalidAmount';
        });

        return errors;
    };

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    const submit = (values) => {
        const amount1 = filterInput(values.amount1);
        const amount2 = filterInput(values.amount2);
        const amount3 = filterInput(values.amount3);

        const validateCode = [amount1, amount2, amount3].join(',');

        // Send valid amounts to BankAccountAPI::validateBankAccount in Web-Expensify
        const bankaccountID = lodashGet(reimbursementAccount, 'achData.bankAccountID');
        BankAccounts.validateBankAccount(bankaccountID, validateCode);
    };

    const state = lodashGet(reimbursementAccount, 'achData.state');

    // If a user tries to navigate directly to the validate page we'll show them the EnableStep
    if (state === BankAccount.STATE.OPEN) {
        return <EnableStep />;
    }

    const maxAttemptsReached = lodashGet(reimbursementAccount, 'maxAttemptsReached');
    const isVerifying = !maxAttemptsReached && state === BankAccount.STATE.VERIFYING;
    const requiresTwoFactorAuth = lodashGet(account, 'requiresTwoFactorAuth');

    return (
        <ScreenWrapper
            style={[styles.flex1, styles.justifyContentBetween]}
            includeSafeAreaPaddingBottom={false}
            testID={ValidationStep.displayName}
        >
            <HeaderWithBackButton
                title={isVerifying ? translate('validationStep.headerTitle') : translate('workspace.common.testTransactions')}
                stepCounter={isVerifying ? undefined : {step: 5, total: 5}}
                onBackButtonPress={onBackButtonPress}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
            />
            {maxAttemptsReached && (
                <View style={[styles.m5, styles.flex1]}>
                    <Text>
                        {translate('validationStep.maxAttemptsReached')} {translate('common.please')}{' '}
                        <TextLink onPress={Report.navigateToConciergeChat}>{translate('common.contactUs')}</TextLink>.
                    </Text>
                </View>
            )}
            {!maxAttemptsReached && state === BankAccount.STATE.PENDING && (
                <FormProvider
                    formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                    submitButtonText={translate('validationStep.buttonText')}
                    onSubmit={submit}
                    validate={validate}
                    style={[styles.mh5, styles.mt3, styles.flexGrow1]}
                >
                    <View style={[styles.mb2]}>
                        <Text style={[styles.mb5]}>{translate('validationStep.description')}</Text>
                        <Text style={[styles.mb2]}>{translate('validationStep.descriptionCTA')}</Text>
                    </View>
                    <View style={[styles.mv5]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="amount1"
                            shouldSaveDraft
                            containerStyles={[styles.mb1]}
                            placeholder="1.52"
                            inputMode={CONST.INPUT_MODE.DECIMAL}
                            role={CONST.ROLE.PRESENTATION}
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="amount2"
                            shouldSaveDraft
                            containerStyles={[styles.mb1]}
                            placeholder="1.53"
                            inputMode={CONST.INPUT_MODE.DECIMAL}
                            role={CONST.ROLE.PRESENTATION}
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            shouldSaveDraft
                            inputID="amount3"
                            containerStyles={[styles.mb1]}
                            placeholder="1.54"
                            inputMode={CONST.INPUT_MODE.DECIMAL}
                            role={CONST.ROLE.PRESENTATION}
                        />
                    </View>
                    {!requiresTwoFactorAuth && (
                        <View style={[styles.mln5, styles.mrn5]}>
                            <Enable2FAPrompt policyID={policyID} />
                        </View>
                    )}
                </FormProvider>
            )}
            {isVerifying && (
                <ScrollView style={[styles.flex1]}>
                    <Section
                        title={translate('workspace.bankAccount.letsFinishInChat')}
                        icon={Illustrations.ConciergeBubble}
                    >
                        <Text>{translate('validationStep.letsChatText')}</Text>
                        <Button
                            text={translate('validationStep.letsChatCTA')}
                            onPress={Report.navigateToConciergeChat}
                            icon={Expensicons.ChatBubble}
                            style={[styles.mt4]}
                            iconStyles={[styles.buttonCTAIcon]}
                            shouldShowRightIcon
                            large
                            success
                        />
                        <MenuItem
                            title={translate('workspace.bankAccount.noLetsStartOver')}
                            icon={Expensicons.RotateLeft}
                            onPress={BankAccounts.requestResetFreePlanBankAccount}
                            shouldShowRightIcon
                            wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                        />
                    </Section>
                    {reimbursementAccount.shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={reimbursementAccount} />}
                    {!requiresTwoFactorAuth && <Enable2FAPrompt policyID={policyID} />}
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

ValidationStep.propTypes = propTypes;
ValidationStep.defaultProps = defaultProps;
ValidationStep.displayName = 'ValidationStep';

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(ValidationStep);
