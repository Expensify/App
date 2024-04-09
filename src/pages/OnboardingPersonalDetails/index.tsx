import React from 'react';
import type {BaseOnboardingPersonalDetailsProps} from './BaseOnboardingPersonalDetails';
import BaseOnboardingPersonalDetails from './BaseOnboardingPersonalDetails';

function OnboardingPersonalDetails({...rest}: Omit<BaseOnboardingPersonalDetailsProps, 'shouldUseNativeStyles'>) {
    return (
        <BaseOnboardingPersonalDetails
            shouldUseNativeStyles={false}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingPersonalDetails.displayName = 'OnboardingPurpose';

export default OnboardingPersonalDetails;
