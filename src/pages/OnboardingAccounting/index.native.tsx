import React from 'react';

import type {OnboardingAccountingProps} from './types';

import BaseOnboardingAccounting from './BaseOnboardingAccounting';

function OnboardingAccounting(props: OnboardingAccountingProps) {
    return (
        <BaseOnboardingAccounting
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingAccounting;
