import React from 'react';
import BaseOnboardingPersonalDetails from './BaseOnboardingPersonalDetails';
import type {OnboardingPersonalDetailsProps} from './types';

function OnboardingPersonalDetails({...rest}: Omit<OnboardingPersonalDetailsProps, 'shouldUseNativeStyles'>) {
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
