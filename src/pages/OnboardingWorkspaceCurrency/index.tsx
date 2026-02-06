import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkspaceCurrency from './BaseOnboardingWorkspaceCurrency';
import type {OnboardingWorkspaceCurrencyProps} from './types';

function OnboardingWorkspaceCurrency({...rest}: OnboardingWorkspaceCurrencyProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkspaceCurrency
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkspaceCurrency;
