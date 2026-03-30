import React from 'react';
import type {ForwardedRef} from 'react';
import type {View} from 'react-native';
import PersonalInfo from './PersonalInfo/PersonalInfo';

type RequestorStepProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;

    /** Back to URL for preserving navigation context */
    backTo?: string;
};

function RequestorStep({onBackButtonPress, onSubmit, ref, backTo}: RequestorStepProps) {
    return (
        <PersonalInfo
            ref={ref}
            onBackButtonPress={onBackButtonPress}
            onSubmit={onSubmit}
            backTo={backTo}
        />
    );
}

export default RequestorStep;
