import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingInterestedFeatures from './BaseOnboardingInterestedFeatures';
import type {OnboardingInterestedFeaturesProps} from './types';

function OnboardingInterestedFeatures(props: OnboardingInterestedFeaturesProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingInterestedFeatures
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingInterestedFeatures;
