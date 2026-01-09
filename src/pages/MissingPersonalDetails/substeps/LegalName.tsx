import React from 'react';
import FullNameStep from '@components/SubStepForms/FullNameStep';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import type {CustomSubPageProps} from '@pages/MissingPersonalDetails/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.LEGAL_FIRST_NAME, INPUT_IDS.LEGAL_LAST_NAME];

function LegalName({isEditing, onNext, onMove, personalDetailsValues}: CustomSubPageProps) {
    const {translate} = useLocalize();

    const defaultValues = {
        firstName: personalDetailsValues[INPUT_IDS.LEGAL_FIRST_NAME],
        lastName: personalDetailsValues[INPUT_IDS.LEGAL_LAST_NAME],
    };

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <FullNameStep<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            formTitle={translate('privatePersonalDetails.enterLegalName')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            firstNameInputID={INPUT_IDS.LEGAL_FIRST_NAME}
            lastNameInputID={INPUT_IDS.LEGAL_LAST_NAME}
            defaultValues={defaultValues}
            shouldShowHelpLinks={false}
        />
    );
}

export default LegalName;
