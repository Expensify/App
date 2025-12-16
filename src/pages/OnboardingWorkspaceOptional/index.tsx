import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkspaceOptional from './BaseOnboardingWorkspaceOptional';
import type {OnboardingWorkspaceOptionalProps} from './types';

function OnboardingWorkspaceOptional(props: OnboardingWorkspaceOptionalProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaceOptional
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkspaceOptional;
