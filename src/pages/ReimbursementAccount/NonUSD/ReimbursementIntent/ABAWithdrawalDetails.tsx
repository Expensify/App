import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ABAWithdrawalAccountForm';

import React from 'react';
import {View} from 'react-native';

const REQUIRED_FIELDS = [INPUT_IDS.BSB_NUMBER, INPUT_IDS.ACCOUNT_NUMBER, INPUT_IDS.BANK_USER_IDENTIFICATION_NUMBER, INPUT_IDS.COMPANY_NAME];

type ABAWithdrawalDetailsProps = {
    /** Currency of the workspace the account pays from */
    currency?: string;

    onBackButtonPress: () => void;
};

function TermsOfServiceLabel() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // CheckboxWithLabel indents plain text labels by ml1 but not custom ones, so this adds the same indent to line up with them
    return (
        <View style={styles.ml1}>
            <RenderHTML html={translate('common.acceptTermsOfService')} />
        </View>
    );
}

/**
 * Collects the details of an AU bank account that a workspace pays from outside of Expensify, with ABA files.
 */
function ABAWithdrawalDetails({currency, onBackButtonPress}: ABAWithdrawalDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ABA_WITHDRAWAL_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ABA_WITHDRAWAL_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, REQUIRED_FIELDS, translate);
        const bsbNumber = values[INPUT_IDS.BSB_NUMBER]?.trim();
        const accountNumber = values[INPUT_IDS.ACCOUNT_NUMBER]?.trim();
        const bankUserIdentificationNumber = values[INPUT_IDS.BANK_USER_IDENTIFICATION_NUMBER]?.trim();

        if (bsbNumber && !CONST.BANK_ACCOUNT.REGEX.AU_BSB_NUMBER.test(bsbNumber)) {
            errors[INPUT_IDS.BSB_NUMBER] = translate('abaWithdrawalDetailsStep.error.bsbNumber');
        }
        if (accountNumber && !CONST.BANK_ACCOUNT.REGEX.AU_ACCOUNT_NUMBER.test(accountNumber)) {
            errors[INPUT_IDS.ACCOUNT_NUMBER] = translate('bankAccount.error.accountNumber');
        }
        if (bankUserIdentificationNumber && !CONST.BANK_ACCOUNT.REGEX.AU_BANK_USER_IDENTIFICATION_NUMBER.test(bankUserIdentificationNumber)) {
            errors[INPUT_IDS.BANK_USER_IDENTIFICATION_NUMBER] = translate('abaWithdrawalDetailsStep.error.bankUserIdentificationNumber');
        }
        if (!values[INPUT_IDS.ACCEPT_TERMS]) {
            errors[INPUT_IDS.ACCEPT_TERMS] = translate('common.error.acceptTerms');
        }

        return errors;
    };

    return (
        <InteractiveStepWrapper
            wrapperID="ABAWithdrawalDetails"
            handleBackButtonPress={onBackButtonPress}
            headerTitle={translate('bankAccount.addBankAccount')}
        >
            <FormProvider
                formID={ONYXKEYS.FORMS.ABA_WITHDRAWAL_ACCOUNT_FORM}
                validate={validate}
                onSubmit={() => {}}
                submitButtonText={translate('common.next')}
                style={styles.flexGrow1}
                submitButtonStyles={styles.mh5}
                enabledWhenOffline={false}
                shouldHideFixErrorsAlert
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('abaWithdrawalDetailsStep.title')}</Text>
                <MenuItemField
                    name={translate('common.currency')}
                    value={currency}
                />
                <View style={styles.ph5}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.BSB_NUMBER}
                        label={translate('abaWithdrawalDetailsStep.bsbNumber')}
                        aria-label={translate('abaWithdrawalDetailsStep.bsbNumber')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={styles.mt3}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.ACCOUNT_NUMBER}
                        label={translate('abaWithdrawalDetailsStep.accountNumber')}
                        aria-label={translate('abaWithdrawalDetailsStep.accountNumber')}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        containerStyles={styles.mt6}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.BANK_USER_IDENTIFICATION_NUMBER}
                        label={translate('abaWithdrawalDetailsStep.bankUserIdentificationNumber')}
                        aria-label={translate('abaWithdrawalDetailsStep.bankUserIdentificationNumber')}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        containerStyles={styles.mt6}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMPANY_NAME}
                        label={translate('abaWithdrawalDetailsStep.companyName')}
                        aria-label={translate('abaWithdrawalDetailsStep.companyName')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={styles.mt6}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={CheckboxWithLabel}
                        inputID={INPUT_IDS.SHOULD_INCLUDE_SELF_BALANCING_TRANSACTION}
                        label={translate('abaWithdrawalDetailsStep.includeSelfBalancingTransaction')}
                        aria-label={translate('abaWithdrawalDetailsStep.includeSelfBalancingTransaction')}
                        defaultValue={false}
                        style={styles.mt6}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={CheckboxWithLabel}
                        inputID={INPUT_IDS.ACCEPT_TERMS}
                        LabelComponent={TermsOfServiceLabel}
                        aria-label={`${translate('common.iAcceptThe')} ${translate('common.addCardTermsOfService')}`}
                        defaultValue={false}
                        style={styles.mt3}
                    />
                    <TextLink
                        href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}
                        style={styles.mt3}
                    >
                        {translate('common.privacy')}
                    </TextLink>
                </View>
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default ABAWithdrawalDetails;
