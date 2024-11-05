import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import type {BankInfoSubStepProps} from '@pages/ReimbursementAccount/NonUSD/BankInfo/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function BankAccountDetails({onNext, isEditing, corpayFields}: BankInfoSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const bankAccountDetailsFields = useMemo(() => {
        return corpayFields.filter((field) => !field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX));
    }, [corpayFields]);

    const fieldIds = bankAccountDetailsFields.map((field) => field.id);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> = {};

            bankAccountDetailsFields.forEach((field) => {
                const fieldID = field.id as keyof FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>;

                if (field.isRequired && !values[fieldID]) {
                    errors[fieldID] = translate('common.error.fieldRequired');
                }

                field.validationRules.forEach((rule) => {
                    if (rule.regEx) {
                        return;
                    }

                    if (new RegExp(rule.regEx).test(values[fieldID] ? String(values[fieldID]) : '')) {
                        return;
                    }

                    errors[fieldID] = rule.errorMessage;
                });
            });

            return errors;
        },
        [bankAccountDetailsFields, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: fieldIds as Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>>,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const inputs = useMemo(() => {
        return bankAccountDetailsFields.map((field) => {
            return (
                <View
                    style={[styles.flex2, styles.mb6]}
                    key={field.id}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={field.id}
                        label={field.label}
                        aria-label={field.label}
                        role={CONST.ROLE.PRESENTATION}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
            );
        });
    }, [bankAccountDetailsFields, styles.flex2, styles.mb6, isEditing]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankInfoStep.whatAreYour')}</Text>
                {inputs}
            </View>
        </FormProvider>
    );
}

BankAccountDetails.displayName = 'BankAccountDetails';

export default BankAccountDetails;
