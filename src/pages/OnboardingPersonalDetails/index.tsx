import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingPersonalDetails from './BaseOnboardingPersonalDetails';
import type {OnboardingPersonalDetailsProps} from './types';

function OnboardingPersonalDetails({...rest}: OnboardingPersonalDetailsProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingPersonalDetails
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingPersonalDetails;
