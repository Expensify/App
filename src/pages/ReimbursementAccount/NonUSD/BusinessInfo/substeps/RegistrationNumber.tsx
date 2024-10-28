import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type RegistrationNumberProps = SubStepProps;

const {BUSINESS_REGISTRATION_INCORPORATION_NUMBER} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [BUSINESS_REGISTRATION_INCORPORATION_NUMBER];

function RegistrationNumber({onNext, isEditing}: RegistrationNumberProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const defaultValue =
        reimbursementAccount?.achData?.additionalData?.corpay?.[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] ?? reimbursementAccountDraft?.[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] ?? '';

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.whatsTheBusinessRegistrationNumber')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('businessInfoStep.registrationNumber')}
                aria-label={translate('businessInfoStep.registrationNumber')}
                role={CONST.ROLE.PRESENTATION}
                inputID={BUSINESS_REGISTRATION_INCORPORATION_NUMBER}
                containerStyles={[styles.mt6]}
                defaultValue={defaultValue}
                shouldSaveDraft={!isEditing}
            />
        </FormProvider>
    );
}

RegistrationNumber.displayName = 'RegistrationNumber';

export default RegistrationNumber;
