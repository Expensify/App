import React from 'react';

import type {OnboardingInterestedFeaturesProps} from './types';

import BaseOnboardingInterestedFeatures from './BaseOnboardingInterestedFeatures';

function OnboardingInterestedFeatures(props: OnboardingInterestedFeaturesProps) {
    return (
        <BaseOnboardingInterestedFeatures
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingInterestedFeatures;
