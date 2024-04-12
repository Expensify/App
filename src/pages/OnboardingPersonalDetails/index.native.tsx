import React from 'react';
import type {OnboardingPersonalDetailsProps} from '@pages/OnboardingPurpose/types';
import BaseOnboardingPersonalDetails from './BaseOnboardingPersonalDetails';

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
