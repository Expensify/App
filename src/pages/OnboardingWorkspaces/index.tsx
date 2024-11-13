import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';
import type {OnboardingWorkspacesProps} from './types';

function OnboardingWorkspaces({...rest}: OnboardingWorkspacesProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaces
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </OnboardingWrapper>
    );
}

OnboardingWorkspaces.displayName = 'OnboardingWorkspaces';

export default OnboardingWorkspaces;
