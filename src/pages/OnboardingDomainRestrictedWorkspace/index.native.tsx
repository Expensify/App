import React from 'react';
import BaseOnboardingDomainRestrictedWorkspace from './BaseOnboardingDomainRestrictedWorkspace';
import type {OnboardingDomainRestrictedWorkspaceProps} from './types';

function OnboardingDomainRestrictedWorkspace(props: OnboardingDomainRestrictedWorkspaceProps) {
    return (
        <BaseOnboardingDomainRestrictedWorkspace
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

OnboardingDomainRestrictedWorkspace.displayName = 'OnboardingDomainRestrictedWorkspace';

export default OnboardingDomainRestrictedWorkspace;
