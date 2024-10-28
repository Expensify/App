import React from 'react';
import type {OnboardingWorkspacesProps} from './types';
import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';

function OnboardingWorkspaces({...rest}: OnboardingWorkspacesProps) {
    return (
        <BaseOnboardingWorkspaces
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingWorkspaces.displayName = 'OnboardingWorkspaces';

export default OnboardingWorkspaces;
