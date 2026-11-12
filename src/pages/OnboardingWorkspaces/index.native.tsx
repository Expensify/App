import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';

import React from 'react';

import type {OnboardingWorkspacesProps} from './types';

import BaseOnboardingWorkspaces from './BaseOnboardingWorkspaces';

function OnboardingWorkspaces({...rest}: OnboardingWorkspacesProps) {
    const {index: routeIndex} = rest.navigation.getState();

    // Swallow system Back only when this is the first onboarding route, so it cannot pop the onboarding modal.
    // Returning false on a later visit lets Navigation pop as normal.
    useAndroidBackButtonHandler(() => routeIndex === 0);

    return (
        <BaseOnboardingWorkspaces
            shouldUseNativeStyles
            {...rest}
        />
    );
}

export default OnboardingWorkspaces;
