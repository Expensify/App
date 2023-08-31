import React, {useCallback} from 'react';
import _ from 'underscore';
import {Image} from 'react-native';
import lodashGet from 'lodash/get';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import useLocalize from '../../hooks/useLocalize';
import {withLocalizePropTypes} from '../../components/withLocalize';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import exampleCheckImage from './exampleCheckImage';
import Form from '../../components/Form';
import shouldDelayFocus from '../../libs/shouldDelayFocus';
import ScreenWrapper from '../../components/ScreenWrapper';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ..._.omit(StepPropTypes, _.keys(withLocalizePropTypes)),
};

function BankAccountManualStep(props) {
    const {translate, preferredLocale} = useLocalize();
    const {reimbursementAccount, reimbursementAccountDraft} = props;
    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object}
     */
    const validate = useCallback(
        (values) => {
            const requiredFields = ['routingNumber', 'accountNumber'];
            const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);
            const routingNumber = values.routingNumber && values.routingNumber.trim();

            if (
                values.accountNumber &&
                !CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(values.accountNumber.trim()) &&
                !CONST.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim())
            ) {
                errors.accountNumber = 'bankAccount.error.accountNumber';
            } else if (values.accountNumber && values.accountNumber === routingNumber) {
                errors.accountNumber = translate('bankAccount.error.routingAndAccountNumberCannotBeSame');
            }
            if (routingNumber && (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !ValidationUtils.isValidRoutingNumber(routingNumber))) {
                errors.routingNumber = 'bankAccount.error.routingNumber';
            }
            if (!values.acceptTerms) {
                errors.acceptTerms = 'common.error.acceptTerms';
            }

            return errors;
        },
        [translate],
    );

    const submit = useCallback(
        (values) => {
            BankAccounts.connectBankAccountManually(
                lodashGet(reimbursementAccount, 'achData.bankAccountID') || 0,
                values.accountNumber,
                values.routingNumber,
                lodashGet(reimbursementAccountDraft, ['plaidMask']),
            );
        },
        [reimbursementAccount, reimbursementAccountDraft],
    );

    const shouldDisableInputs = Boolean(lodashGet(reimbursementAccount, 'achData.bankAccountID'));

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                stepCounter={{step: 1, total: 5}}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={props.onBackButtonPress}
            />
            <Form
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                onSubmit={submit}
                validate={validate}
                submitButtonText={translate('common.continue')}
                style={[styles.mh5, styles.flexGrow1]}
            >
                <Text style={[styles.mb5]}>{translate('bankAccount.checkHelpLine')}</Text>
                <Image
                    resizeMode="contain"
                    style={[styles.exampleCheckImage, styles.mb5]}
                    source={exampleCheckImage(preferredLocale)}
                />
                <TextInput
                    autoFocus
                    shouldDelayFocus={shouldDelayFocus}
                    inputID="routingNumber"
                    label={translate('bankAccount.routingNumber')}
                    accessibilityLabel={translate('bankAccount.routingNumber')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    defaultValue={props.getDefaultStateForField('routingNumber', '')}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    disabled={shouldDisableInputs}
                    shouldSaveDraft
                    shouldUseDefaultValue={shouldDisableInputs}
                />
                <TextInput
                    inputID="accountNumber"
                    containerStyles={[styles.mt4]}
                    label={translate('bankAccount.accountNumber')}
                    accessibilityLabel={translate('bankAccount.accountNumber')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    defaultValue={props.getDefaultStateForField('accountNumber', '')}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    disabled={shouldDisableInputs}
                    shouldSaveDraft
                    shouldUseDefaultValue={shouldDisableInputs}
                />
                <CheckboxWithLabel
                    accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('common.expensifyTermsOfService')}`}
                    style={styles.mt4}
                    inputID="acceptTerms"
                    LabelComponent={() => (
                        <Text>
                            {translate('common.iAcceptThe')}
                            <TextLink href={CONST.TERMS_URL}>{translate('common.expensifyTermsOfService')}</TextLink>
                        </Text>
                    )}
                    defaultValue={props.getDefaultStateForField('acceptTerms', false)}
                    shouldSaveDraft
                />
            </Form>
        </ScreenWrapper>
    );
}

BankAccountManualStep.propTypes = propTypes;
BankAccountManualStep.displayName = 'BankAccountManualStep';
export default BankAccountManualStep;
