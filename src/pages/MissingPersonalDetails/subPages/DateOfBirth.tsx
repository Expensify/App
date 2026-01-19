import React from 'react';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import type {CustomSubPageProps} from '@pages/MissingPersonalDetails/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.DATE_OF_BIRTH];

function DateOfBirth({isEditing, onNext, onMove, personalDetailsValues}: CustomSubPageProps) {
    const {translate} = useLocalize();

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <DateOfBirthStep<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            formTitle={translate('privatePersonalDetails.enterDateOfBirth')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            dobInputID={INPUT_IDS.DATE_OF_BIRTH}
            dobDefaultValue={personalDetailsValues[INPUT_IDS.DATE_OF_BIRTH]}
        />
    );
}

export default DateOfBirth;
