import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalBankAccountDetailsFormSubmit from '@hooks/usePersonalBankAccountDetailsFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isValidRoutingNumber} from '@libs/ValidationUtils';
import ExampleCheckImage from '@pages/ReimbursementAccount/USD/BankInfo/ExampleCheck';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

type ManualProps = SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const STEP_FIELDS = [BANK_INFO_STEP_KEYS.ROUTING_NUMBER, BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER];

function ManualBankAccountDetailsStep({onNext, isEditing}: ManualProps) {
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, STEP_FIELDS, translate);
        const routingNumber = values.routingNumber?.trim();

        if (
            values.accountNumber &&
            !CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(values.accountNumber.trim()) &&
            !CONST.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim())
        ) {
            errors.accountNumber = translate('bankAccount.error.accountNumber');
        } else if (values.accountNumber && values.accountNumber === routingNumber) {
            errors.accountNumber = translate('bankAccount.error.routingAndAccountNumberCannotBeSame');
        }
        if (routingNumber && (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !isValidRoutingNumber(routingNumber))) {
            errors.routingNumber = translate('bankAccount.error.routingNumber');
        }

        return errors;
    };

    const handleSubmit = usePersonalBankAccountDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            onSubmit={handleSubmit}
            validate={validate}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('bankAccount.manuallyAdd')}</Text>
            <Text style={[styles.mb5, styles.textSupporting]}>{translate('bankAccount.checkHelpLine')}</Text>
            <ExampleCheckImage />
            <InputWrapper
                InputComponent={TextInput}
                ref={inputCallbackRef}
                inputID={BANK_INFO_STEP_KEYS.ROUTING_NUMBER}
                label={translate('bankAccount.routingNumber')}
                aria-label={translate('bankAccount.routingNumber')}
                role={CONST.ROLE.PRESENTATION}
                value={bankAccountPersonalDetails?.routingNumber ?? ''}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={TextInput}
                inputID={BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER}
                containerStyles={[styles.mt6]}
                label={translate('bankAccount.accountNumber')}
                aria-label={translate('bankAccount.accountNumber')}
                role={CONST.ROLE.PRESENTATION}
                value={bankAccountPersonalDetails?.accountNumber ?? ''}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

ManualBankAccountDetailsStep.displayName = 'ManualBankAccountDetailsStep';

export default ManualBankAccountDetailsStep;
