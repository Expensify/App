import React from 'react';
import type {ForwardedRef} from 'react';
import type {View} from 'react-native';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import VerifyIdentity from './VerifyIdentity/VerifyIdentity';

type RequestorStepProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** If we should show Onfido flow */
    shouldShowOnfido: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
};

function RequestorStep({shouldShowOnfido, onBackButtonPress, ref}: RequestorStepProps) {
    if (shouldShowOnfido) {
        return <VerifyIdentity onBackButtonPress={onBackButtonPress} />;
    }

    return (
        <PersonalInfo
            ref={ref}
            onBackButtonPress={onBackButtonPress}
        />
    );
}

export default RequestorStep;
