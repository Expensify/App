import React from 'react';
import BaseOnboardingPersonalDetails from './BaseOnboardingPersonalDetails';
import type {OnboardingPersonalDetailsProps} from './types';

function OnboardingPersonalDetails({...rest}: OnboardingPersonalDetailsProps) {
    return (
        <BaseOnboardingPersonalDetails
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingPersonalDetails.displayName = 'OnboardingPurpose';

export default OnboardingPersonalDetails;
