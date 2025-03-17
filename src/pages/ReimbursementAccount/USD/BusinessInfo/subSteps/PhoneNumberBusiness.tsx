import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidUSPhone} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const COMPANY_PHONE_NUMBER_KEY = INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_PHONE;
const STEP_FIELDS = [COMPANY_PHONE_NUMBER_KEY];

function PhoneNumberBusiness({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const defaultCompanyPhoneNumber = reimbursementAccount?.achData?.companyPhone ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.companyPhone && !isValidUSPhone(values.companyPhone, true)) {
                errors.companyPhone = translate('bankAccount.error.phoneNumber');
            }

            return errors;
        },
        [translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        // During draft saving, the phone number is sanitized (i.e. leading and trailing whitespace is removed)
        shouldSaveDraft: true,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.enterYourCompanysPhoneNumber')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={COMPANY_PHONE_NUMBER_KEY}
            inputMode={CONST.INPUT_MODE.TEL}
            inputLabel={translate('common.phoneNumber')}
            defaultValue={defaultCompanyPhoneNumber}
            shouldShowHelpLinks={false}
            placeholder={translate('common.phoneNumberPlaceholder')}
        />
    );
}

PhoneNumberBusiness.displayName = 'PhoneNumberBusiness';

export default PhoneNumberBusiness;
