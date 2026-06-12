import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';
import type {OnboardingWorkspacesProps} from './types';

function OnboardingWorkspaces({...rest}: OnboardingWorkspacesProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaces
                shouldUseNativeStyles={false}
                {...rest}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkspaces;
