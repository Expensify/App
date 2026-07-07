import React from 'react';

import type {OnboardingPersonalTrackGoalProps} from './types';

import BaseOnboardingPersonalTrackGoal from './BaseOnboardingPersonalTrackGoal';

function OnboardingPersonalTrackGoal(props: OnboardingPersonalTrackGoalProps) {
    return (
        <BaseOnboardingPersonalTrackGoal
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingPersonalTrackGoal;
