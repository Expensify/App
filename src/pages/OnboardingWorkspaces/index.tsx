import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingWorkspacesProps} from './types';

import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';

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
