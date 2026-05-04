import React from 'react';
import BaseOnboardingPersonalTrackGoal from './BaseOnboardingPersonalTrackGoal';
import type {OnboardingPersonalTrackGoalProps} from './types';

function OnboardingPersonalTrackGoal(props: OnboardingPersonalTrackGoalProps) {
    return (
        <BaseOnboardingPersonalTrackGoal
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default OnboardingPersonalTrackGoal;
