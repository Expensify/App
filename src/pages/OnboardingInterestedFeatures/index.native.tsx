import React from 'react';
import BaseOnboardingInterestedFeatures from './BaseOnboardingInterestedFeatures';
import type {OnboardingInterestedFeaturesProps} from './types';

function OnboardingInterestedFeatures(props: OnboardingInterestedFeaturesProps) {
    return (
        <BaseOnboardingInterestedFeatures
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default OnboardingInterestedFeatures;
