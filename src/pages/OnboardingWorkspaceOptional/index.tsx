import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkspaceOptional from './BaseOnboardingWorkspaceOptional';
import type {OnboardingWorkspaceOptionalProps} from './types';

function OnboardingWorkspaceOptional(props: OnboardingWorkspaceOptionalProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaceOptional
                shouldUseNativeStyles={false}
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkspaceOptional;
