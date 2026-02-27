import React from 'react';
import BaseOnboardingWorkspaceOptional from './BaseOnboardingWorkspaceOptional';
import type {OnboardingWorkspaceOptionalProps} from './types';

function OnboardingWorkspaceOptional(props: OnboardingWorkspaceOptionalProps) {
    return (
        <BaseOnboardingWorkspaceOptional
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default OnboardingWorkspaceOptional;
