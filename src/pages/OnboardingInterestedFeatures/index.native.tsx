import React from 'react';
import BaseOnboardingInterestedFeatures from './BaseOnboardingInterestedFeatures';
import type {OnboardingInterestedFeaturesProps} from './types';

function OnboardingInterestedFeatures(props: OnboardingInterestedFeaturesProps) {
    return (
        <BaseOnboardingInterestedFeatures
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingInterestedFeatures;
