import React from 'react';
import BaseOnboardingWorkspaceCurrency from './BaseOnboardingWorkspaceCurrency';
import type {OnboardingWorkspaceCurrencyProps} from './types';

function OnboardingWorkspaceCurrency({...rest}: OnboardingWorkspaceCurrencyProps) {
    return (
        <BaseOnboardingWorkspaceCurrency
            shouldUseNativeStyles
            {...rest}
        />
    );
}

export default OnboardingWorkspaceCurrency;
