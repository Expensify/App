import React, { useState } from 'react';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import ONYXKEYS from '@src/ONYXKEYS';
import PinStep from '@components/SubStepForms/PinStep';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import PinConfirmationStep from '@components/SubStepForms/PinConfirmationStep';

const STEP_FIELDS = [INPUT_IDS.PIN];

function Pin({isEditing, onNext, onMove, personalDetailsValues}: CustomSubStepProps) {
    const [pinCode, setPinCode] = useState('');
    // const [finalPinCode, setfinalPinCode] = useState('');
    const [isFirstPinInputVisible, setFirstPinInputVisibility] = useState(true)

    const handleFirstSubmit = (value: string) => {
        setPinCode(value);
        setFirstPinInputVisibility(!isFirstPinInputVisible)
    };

    // const handleSecondSubmit = (value: string) => {
    //     setfinalPinCode(value);
    //     onNext();
    // };
    const handleSecondSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <>
            {isFirstPinInputVisible && (
                <PinStep
                formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
                formTitle="Set the PIN for your card."
                isEditing={isEditing}
                onNext={onNext}
                onMove={onMove}
                handleSubmit={() => handleFirstSubmit(pinCode)}
                />
            )}
            {!isFirstPinInputVisible && (
                <PinConfirmationStep
                formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
                formTitle="Enter your PIN again to confirm"
                isEditing={isEditing}
                onNext={onNext}
                onMove={onMove}
                handleSubmit={handleSecondSubmit}
                stepFields={STEP_FIELDS}
                pinCodeInputID={INPUT_IDS.PIN}
                defaultValues={personalDetailsValues[INPUT_IDS.PIN]}
                shouldShowHelpLinks={false}
                />
            )}
        </>
);
}

Pin.displayName = 'Pin';

export default Pin;
