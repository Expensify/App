import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingInterestedFeatures from './BaseOnboardingInterestedFeatures';
import type {OnboardingInterestedFeaturesProps} from './types';

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
