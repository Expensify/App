import React, { useState } from 'react';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import ONYXKEYS from '@src/ONYXKEYS';
import PinStep from '@components/SubStepForms/PinStep';

function Pin({isEditing, onNext, onMove}: CustomSubStepProps) {
    const [pinCode, setPinCode] = useState('');

    const handleSubmit = ({
        setPinCode,
        onNext,
    });

    return (
        <PinStep
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            handleSubmit={handleSubmit}
        />
);
}

Pin.displayName = 'Pin';

export default Pin;
