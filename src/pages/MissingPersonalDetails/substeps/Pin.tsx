import React from 'react';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import PinStep from '@components/SubStepForms/PinStep';

const STEP_FIELDS = [INPUT_IDS.LEGAL_FIRST_NAME, INPUT_IDS.LEGAL_LAST_NAME];

function Pin({isEditing, onNext, onMove, personalDetailsValues}: CustomSubStepProps) {

    // const defaultValues = {
    //     isValidPinCode: personalDetailsValues[INPUT_IDS.PIN],
    // };

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <PinStep
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            // ref={inputValidateCodeRef}
            // name="inputCode"
            // value={validateCode}
            // onChangeText={onTextInput}
            // errorText={errorText}
            // hasError={canShowError && !isEmptyObject(finalValidateError)}
            handleSubmit={handleSubmit}
            // defaultValues={defaultValues}
            // maxLength={4}
            // autoFocus
            // isCursorOn={false}
            // isPastingAllowed={false}
            // isInputMasked={isRevealed}
        />
);
}

Pin.displayName = 'Pin';

export default Pin;
