import React from 'react';
import BaseOnboardingWorkspaceInvite from './BaseOnboardingWorkspaceInvite';
import type {OnboardingWorkspaceInviteProps} from './types';

function OnboardingWorkspaceInvite({...rest}: OnboardingWorkspaceInviteProps) {
    return (
        <BaseOnboardingWorkspaceInvite
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingWorkspaceInvite.displayName = 'OnboardingWorkspaceInvite';

export default OnboardingWorkspaceInvite;
