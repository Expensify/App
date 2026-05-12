import React from 'react';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import {isValidPastDate, meetsMaximumAgeRequirement, meetsMinimumAgeRequirement} from '@libs/ValidationUtils';
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

    const dobValue = personalDetailsValues[INPUT_IDS.DATE_OF_BIRTH];
    const isValidDOB = dobValue !== '' && isValidPastDate(dobValue) && meetsMaximumAgeRequirement(dobValue) && meetsMinimumAgeRequirement(dobValue);

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
            dobDefaultValue={isValidDOB ? dobValue : ''}
        />
    );
}

export default DateOfBirth;
