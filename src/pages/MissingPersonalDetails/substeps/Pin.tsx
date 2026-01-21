import React, {useContext, useState} from 'react';
import PinStep from '@components/SubStepForms/PinStep';
import useLocalize from '@hooks/useLocalize';
import {PinCodeContext} from '@pages/MissingPersonalDetails/MissingPersonalDetailsContent';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import ONYXKEYS from '@src/ONYXKEYS';

function Pin({isEditing, onNext, onMove}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const [firstInputPinCode, setFirstInputPinCode] = useState('');
    const [isFirstPinInputVisible, setFirstPinInputVisibility] = useState(true);
    const {setFinalPinCode} = useContext(PinCodeContext);

    const handleFirstInputSubmit = (value: string) => {
        setFirstInputPinCode(value);
        setFirstPinInputVisibility(!isFirstPinInputVisible);
    };

    const handleConfirmationSubmit = (value: string) => {
        setFinalPinCode(value);
        onNext();
    };

    return (
        <>
            {isFirstPinInputVisible && (
                <PinStep
                    formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
                    formTitle={translate('privatePersonalDetails.enterPinCode')}
                    isEditing={isEditing}
                    onNext={onNext}
                    onMove={onMove}
                    handleSubmit={handleFirstInputSubmit}
                />
            )}
            {!isFirstPinInputVisible && (
                <PinStep
                    formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
                    formTitle={translate('privatePersonalDetails.verifyPinCode')}
                    isEditing={isEditing}
                    onNext={onNext}
                    onMove={onMove}
                    handleSubmit={handleConfirmationSubmit}
                    pinCodeToMatch={firstInputPinCode}
                />
            )}
        </>
    );
}

Pin.displayName = 'Pin';

export default Pin;
