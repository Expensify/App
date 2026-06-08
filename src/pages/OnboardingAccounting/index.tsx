import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingAccounting from './BaseOnboardingAccounting';
import type {OnboardingAccountingProps} from './types';

function OnboardingAccounting(props: OnboardingAccountingProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingAccounting
                shouldUseNativeStyles={false}
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingAccounting;
