import React from 'react';
import RegistrationNumberStep from '@components/SubStepForms/RegistrationNumberStep';
import useEnableGlobalReimbursementsStepFormSubmit from '@hooks/useEnableGlobalReimbursementsStepFormSubmit';
import useOnyx from '@hooks/useOnyx';
import type {BusinessInfoSubPageProps} from '@pages/settings/Wallet/EnableGlobalReimbursements/EnableGlobalReimbursementsBusinessPage/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

const {BUSINESS_REGISTRATION_INCORPORATION_NUMBER} = INPUT_IDS;
const STEP_FIELDS = [BUSINESS_REGISTRATION_INCORPORATION_NUMBER];

function RegistrationNumber({onNext, onMove, isEditing, country}: BusinessInfoSubPageProps) {
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT);
    const handleSubmit = useEnableGlobalReimbursementsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <RegistrationNumberStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            onSubmit={handleSubmit}
            inputID={BUSINESS_REGISTRATION_INCORPORATION_NUMBER}
            defaultValue={enableGlobalReimbursementsDraft?.[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] ?? ''}
            country={country}
            shouldDelayAutoFocus
        />
    );
}

export default RegistrationNumber;
