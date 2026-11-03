import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingInterestedFeaturesProps} from './types';

import BaseOnboardingInterestedFeatures from './BaseOnboardingInterestedFeatures';

function OnboardingInterestedFeatures(props: OnboardingInterestedFeaturesProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingInterestedFeatures
                shouldUseNativeStyles={false}
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingInterestedFeatures;
