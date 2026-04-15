import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import BaseOnboardingWorkspaceConfirmation from './BaseOnboardingWorkspaceConfirmation';
import type {OnboardingWorkspaceConfirmationProps} from './types';

function DynamicOnboardingWorkspaceConfirmation({...rest}: OnboardingWorkspaceConfirmationProps) {
    const navigateBackTo = useDynamicBackPath(DYNAMIC_ROUTES.ONBOARDING_WORKSPACE_CONFIRMATION.path);

    return (
        <BaseOnboardingWorkspaceConfirmation
            shouldUseNativeStyles
            navigateBackTo={navigateBackTo}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default DynamicOnboardingWorkspaceConfirmation;
