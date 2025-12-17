import React from 'react';
import BaseOnboardingWorkspaceCurrency from './BaseOnboardingWorkspaceCurrency';
import type {OnboardingWorkspaceCurrencyProps} from './types';

function OnboardingWorkspaceCurrency({...rest}: OnboardingWorkspaceCurrencyProps) {
    return (
        <BaseOnboardingWorkspaceCurrency
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default OnboardingWorkspaceCurrency;
