import React from 'react';
import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';
import type {OnboardingWorkspacesProps} from './types';

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
