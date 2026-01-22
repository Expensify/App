import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isValidEmail, isValidPhoneInternational} from '@libs/ValidationUtils';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type ContactInformationProps = SubStepProps;

const {BUSINESS_CONTACT_NUMBER, BUSINESS_CONFIRMATION_EMAIL} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const STEP_FIELDS = [BUSINESS_CONTACT_NUMBER, BUSINESS_CONFIRMATION_EMAIL];

function ContactInformation({onNext, isEditing}: ContactInformationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const primaryLogin = account?.primaryLogin ?? '';

    const phoneNumberDefaultValue = reimbursementAccount?.achData?.corpay?.[BUSINESS_CONTACT_NUMBER] ?? '';
    const confirmationEmailDefaultValue = reimbursementAccount?.achData?.corpay?.[BUSINESS_CONFIRMATION_EMAIL] ?? primaryLogin ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (values[BUSINESS_CONTACT_NUMBER] && !isValidPhoneInternational(values[BUSINESS_CONTACT_NUMBER])) {
                errors[BUSINESS_CONTACT_NUMBER] = translate('common.error.phoneNumber');
            }

            if (values[BUSINESS_CONFIRMATION_EMAIL] && !isValidEmail(values[BUSINESS_CONFIRMATION_EMAIL])) {
                errors[BUSINESS_CONFIRMATION_EMAIL] = translate('common.error.email');
            }

            return errors;
        },
        [translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext: (values) => {
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {
                [BUSINESS_CONFIRMATION_EMAIL]: (values as FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>)[BUSINESS_CONFIRMATION_EMAIL],
            });
            onNext();
        },
        shouldSaveDraft: true,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('businessInfoStep.whatsTheBusinessContactInformation')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('common.phoneNumber')}
                aria-label={translate('common.phoneNumber')}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.TEL}
                inputID={BUSINESS_CONTACT_NUMBER}
                containerStyles={[styles.mt5, styles.mh5]}
                defaultValue={phoneNumberDefaultValue}
                shouldSaveDraft={!isEditing}
                autoComplete="tel"
            />
            <InputWrapper
                InputComponent={TextInput}
                label={translate('common.email')}
                aria-label={translate('common.email')}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.EMAIL}
                inputID={BUSINESS_CONFIRMATION_EMAIL}
                containerStyles={[styles.mt5, styles.mh5]}
                defaultValue={confirmationEmailDefaultValue}
                shouldSaveDraft={!isEditing}
                autoComplete="email"
            />
        </FormProvider>
    );
}

export default ContactInformation;
