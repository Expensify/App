import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingDomainRestrictedWorkspace from './BaseOnboardingDomainRestrictedWorkspace';
import type {OnboardingDomainRestrictedWorkspaceProps} from './types';

function OnboardingDomainRestrictedWorkspace(props: OnboardingDomainRestrictedWorkspaceProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingDomainRestrictedWorkspace
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </OnboardingWrapper>
    );
}

OnboardingDomainRestrictedWorkspace.displayName = 'OnboardingDomainRestrictedWorkspace';

export default OnboardingDomainRestrictedWorkspace;
