import React from 'react';
import BaseOnboardingWorkspaceConfirmation from './BaseOnboardingWorkspaceConfirmation';
import type {OnboardingWorkspaceConfirmationProps} from './types';

function OnboardingWorkspaceConfirmation({...rest}: OnboardingWorkspaceConfirmationProps) {
    return (
        <BaseOnboardingWorkspaceConfirmation
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default OnboardingWorkspaceConfirmation;
