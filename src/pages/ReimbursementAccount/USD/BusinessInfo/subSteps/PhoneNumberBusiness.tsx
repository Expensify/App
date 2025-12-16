import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidUSPhone} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const COMPANY_PHONE_NUMBER_KEY = INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_PHONE;
const STEP_FIELDS = [COMPANY_PHONE_NUMBER_KEY];

function PhoneNumberBusiness({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount, reimbursementAccountResult] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const isLoadingReimbursementAccount = isLoadingOnyxValue(reimbursementAccountResult);

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

    if (isLoadingReimbursementAccount) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.enterYourCompanyPhoneNumber')}
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

export default PhoneNumberBusiness;
