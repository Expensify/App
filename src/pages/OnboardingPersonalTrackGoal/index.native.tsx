import React from 'react';
import BaseOnboardingPersonalTrackGoal from './BaseOnboardingPersonalTrackGoal';
import type {OnboardingPersonalTrackGoalProps} from './types';

function OnboardingPersonalTrackGoal(props: OnboardingPersonalTrackGoalProps) {
    return (
        <BaseOnboardingPersonalTrackGoal
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingPersonalTrackGoal;
