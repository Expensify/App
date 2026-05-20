import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkspaceInvite from './BaseOnboardingWorkspaceInvite';
import type {OnboardingWorkspaceInviteProps} from './types';

function OnboardingWorkspaceInvite({...rest}: OnboardingWorkspaceInviteProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaceInvite
                shouldUseNativeStyles={false}
                {...rest}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkspaceInvite;
