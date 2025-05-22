import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkspaceInvite from './BaseOnboardingWorkspaceInvite';
import type {OnboardingWorkspaceInviteProps} from './types';

function OnboardingWorkspaceInvite({...rest}: OnboardingWorkspaceInviteProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaceInvite
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </OnboardingWrapper>
    );
}

OnboardingWorkspaceInvite.displayName = 'OnboardingWorkspaceInvite';

export default OnboardingWorkspaceInvite;
