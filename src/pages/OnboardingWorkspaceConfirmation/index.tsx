import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import BaseOnboardingWorkspaceConfirmation from './BaseOnboardingWorkspaceConfirmation';
import type {OnboardingWorkspaceConfirmationProps} from './types';

function DynamicOnboardingWorkspaceConfirmation({...rest}: OnboardingWorkspaceConfirmationProps) {
    const navigateBackTo = useDynamicBackPath(DYNAMIC_ROUTES.ONBOARDING_WORKSPACE_CONFIRMATION.path);

    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaceConfirmation
                shouldUseNativeStyles={false}
                navigateBackTo={navigateBackTo}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </OnboardingWrapper>
    );
}

export default DynamicOnboardingWorkspaceConfirmation;
