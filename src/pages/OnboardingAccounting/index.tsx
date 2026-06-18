import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingAccountingProps} from './types';

import BaseOnboardingAccounting from './BaseOnboardingAccounting';

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
