import React from 'react';
import RegistrationNumberStep from '@components/SubStepForms/RegistrationNumberStep';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type RegistrationNumberProps = SubStepProps;

const {BUSINESS_REGISTRATION_INCORPORATION_NUMBER, COMPANY_COUNTRY_CODE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [BUSINESS_REGISTRATION_INCORPORATION_NUMBER];

function RegistrationNumber({onNext, onMove, isEditing}: RegistrationNumberProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const defaultValue = reimbursementAccount?.achData?.corpay?.[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] ?? '';
    const businessStepCountryDraftValue = reimbursementAccount?.achData?.corpay?.[COMPANY_COUNTRY_CODE] ?? reimbursementAccountDraft?.[COMPANY_COUNTRY_CODE] ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <RegistrationNumberStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            onSubmit={handleSubmit}
            inputID={BUSINESS_REGISTRATION_INCORPORATION_NUMBER}
            defaultValue={defaultValue}
            country={businessStepCountryDraftValue}
            shouldDelayAutoFocus
        />
    );
}

export default RegistrationNumber;
