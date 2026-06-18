import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingPersonalTrackGoalProps} from './types';

import BaseOnboardingPersonalTrackGoal from './BaseOnboardingPersonalTrackGoal';

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
