import React from 'react';
import BaseOnboardingWorkspaceOptional from './BaseOnboardingWorkspaceOptional';
import type {OnboardingWorkspaceOptionalProps} from './types';

function OnboardingWorkspaceOptional(props: OnboardingWorkspaceOptionalProps) {
    return (
        <BaseOnboardingWorkspaceOptional
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingWorkspaceOptional;
