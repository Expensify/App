import React from 'react';
import BaseOnboardingAccounting from './BaseOnboardingAccounting';
import type {OnboardingAccountingProps} from './types';

function OnboardingAccounting(props: OnboardingAccountingProps) {
    return (
        <BaseOnboardingAccounting
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingAccounting;
