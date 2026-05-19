import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingPersonalTrackGoal from './BaseOnboardingPersonalTrackGoal';
import type {OnboardingPersonalTrackGoalProps} from './types';

function OnboardingPersonalTrackGoal(props: OnboardingPersonalTrackGoalProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingPersonalTrackGoal
                shouldUseNativeStyles={false}
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingPersonalTrackGoal;
