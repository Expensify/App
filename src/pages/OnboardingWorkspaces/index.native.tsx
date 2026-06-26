import React from 'react';

import type {OnboardingWorkspacesProps} from './types';

import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';

function OnboardingWorkspaces({...rest}: OnboardingWorkspacesProps) {
    return (
        <BaseOnboardingWorkspaces
            shouldUseNativeStyles
            {...rest}
        />
    );
}

export default OnboardingWorkspaces;
