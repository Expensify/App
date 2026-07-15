import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useInternationalBankAccountFormSubmit from '@hooks/useInternationalBankAccountFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import type CustomSubPageProps from '@pages/settings/Wallet/InternationalDepositAccount/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useCallback} from 'react';
import {View} from 'react-native';

const IBAN = 'iban';
const SWIFT_CODE = 'swiftCode';
const STEP_FIELDS = [IBAN, SWIFT_CODE];

function InternationalBankAccountDetails({isEditing, onNext, formValues}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSubmit = useInternationalBankAccountFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS, translate);

            if (values[IBAN] && !CONST.BANK_ACCOUNT.REGEX.IBAN.test(String(values[IBAN]).trim())) {
                errors[IBAN] = translate('bankAccount.error.swiftCodeOrIban');
            }
            if (values[SWIFT_CODE] && !CONST.BANK_ACCOUNT.REGEX.INTERNATIONAL_SWIFT_CODE.test(String(values[SWIFT_CODE]).trim())) {
                errors[SWIFT_CODE] = translate('bankAccount.error.swiftCodeOrIban');
            }

            return errors;
        },
        [translate],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
        >
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankAccount.internationalBankAccountDetails')}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={IBAN}
                    label={translate('bankAccount.iban')}
                    aria-label={translate('bankAccount.iban')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={formValues[IBAN]}
                    containerStyles={[styles.pv2]}
                    shouldSaveDraft={!isEditing}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={SWIFT_CODE}
                    label={translate('bankAccount.swiftBicCode')}
                    aria-label={translate('bankAccount.swiftBicCode')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={formValues[SWIFT_CODE]}
                    containerStyles={[styles.pv2]}
                    shouldSaveDraft={!isEditing}
                />
            </View>
        </FormProvider>
    );
}

export default InternationalBankAccountDetails;
