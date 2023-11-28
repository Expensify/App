import lodashGet from 'lodash/get';
import React, {useCallback} from 'react';
import {Image} from 'react-native';
import _ from 'underscore';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import {withLocalizePropTypes} from '@components/withLocalize';
import useLocalize from '@hooks/useLocalize';
import shouldDelayFocus from '@libs/shouldDelayFocus';
import * as ValidationUtils from '@libs/ValidationUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import exampleCheckImage from './exampleCheckImage';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ..._.omit(StepPropTypes, _.keys(withLocalizePropTypes)),
};

function BankAccountManualStep(props) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {reimbursementAccount, reimbursementAccountDraft} = props;

    const shouldDisableInputs = Boolean(lodashGet(reimbursementAccount, 'achData.bankAccountID'));

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
                !(shouldDisableInputs && CONST.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim()))
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
        [translate, shouldDisableInputs],
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

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={BankAccountManualStep.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                stepCounter={{step: 1, total: 5}}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={props.onBackButtonPress}
            />
            <FormProvider
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                onSubmit={submit}
                validate={validate}
                submitButtonText={translate('common.continue')}
                style={[styles.mh5, styles.mt3, styles.flexGrow1]}
            >
                <Text style={[styles.mb5]}>{translate('bankAccount.checkHelpLine')}</Text>
                <Image
                    resizeMode="contain"
                    style={[styles.exampleCheckImage, styles.mb5]}
                    source={exampleCheckImage(preferredLocale)}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    autoFocus
                    shouldDelayFocus={shouldDelayFocus}
                    inputID="routingNumber"
                    label={translate('bankAccount.routingNumber')}
                    aria-label={translate('bankAccount.routingNumber')}
                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                    defaultValue={props.getDefaultStateForField('routingNumber', '')}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    disabled={shouldDisableInputs}
                    shouldSaveDraft
                    shouldUseDefaultValue={shouldDisableInputs}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID="accountNumber"
                    containerStyles={[styles.mt4]}
                    label={translate('bankAccount.accountNumber')}
                    aria-label={translate('bankAccount.accountNumber')}
                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                    defaultValue={props.getDefaultStateForField('accountNumber', '')}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    disabled={shouldDisableInputs}
                    shouldSaveDraft
                    shouldUseDefaultValue={shouldDisableInputs}
                />
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    aria-label={`${translate('common.iAcceptThe')} ${translate('common.expensifyTermsOfService')}`}
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
            </FormProvider>
        </ScreenWrapper>
    );
}

BankAccountManualStep.propTypes = propTypes;
BankAccountManualStep.displayName = 'BankAccountManualStep';
export default BankAccountManualStep;
