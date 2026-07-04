import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingPersonalDetailsProps} from './types';

import BaseOnboardingPersonalDetails from './BaseOnboardingPersonalDetails';

function OnboardingPersonalDetails({...rest}: OnboardingPersonalDetailsProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingPersonalDetails
                shouldUseNativeStyles={false}
                {...rest}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingPersonalDetails;
