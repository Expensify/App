import React from 'react';
import RegistrationNumberStep from '@components/SubStepForms/RegistrationNumberStep';
import useEnableGlobalReimbursementsStepFormSubmit from '@hooks/useEnableGlobalReimbursementsStepFormSubmit';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

type RegistrationNumberProps = SubStepProps & {country: Country | ''};

const {BUSINESS_REGISTRATION_INCORPORATION_NUMBER} = INPUT_IDS;
const STEP_FIELDS = [BUSINESS_REGISTRATION_INCORPORATION_NUMBER];

function RegistrationNumber({onNext, onMove, isEditing, country}: RegistrationNumberProps) {
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: true});
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
