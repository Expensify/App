import React from 'react';
import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.DATE_OF_BIRTH] as Array<FormOnyxKeys<keyof OnyxFormValuesMapping>>;

function DateOfBirth({isEditing, onNext, onMove, personalDetailsValues}: CustomSubStepProps) {
    const {translate} = useLocalize();

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    }) as (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => void;

    return (
        <DateOfBirthStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            formTitle={translate('privatePersonalDetails.enterDateOfBirth')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            dobInputID={INPUT_IDS.DATE_OF_BIRTH as keyof FormOnyxValues}
            dobDefaultValue={personalDetailsValues[INPUT_IDS.DATE_OF_BIRTH]}
        />
    );
}

DateOfBirth.defaultName = 'DateOfBirth';

export default DateOfBirth;
