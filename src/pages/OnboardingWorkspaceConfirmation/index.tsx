import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkspaceConfirmation from './BaseOnboardingWorkspaceConfirmation';
import type {OnboardingWorkspaceConfirmationProps} from './types';

function OnboardingWorkspaceConfirmation({...rest}: OnboardingWorkspaceConfirmationProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaceConfirmation
                shouldUseNativeStyles={false}
                {...rest}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkspaceConfirmation;
