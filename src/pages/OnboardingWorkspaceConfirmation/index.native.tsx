import React from 'react';
import BaseOnboardingWorkspaceConfirmation from './BaseOnboardingWorkspaceConfirmation';
import type {OnboardingWorkspaceConfirmationProps} from './types';

function OnboardingWorkspaceConfirmation({...rest}: OnboardingWorkspaceConfirmationProps) {
    return (
        <BaseOnboardingWorkspaceConfirmation
            shouldUseNativeStyles
            {...rest}
        />
    );
}

export default OnboardingWorkspaceConfirmation;
