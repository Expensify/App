import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingAccounting from './BaseOnboardingAccounting';
import type {OnboardingAccountingProps} from './types';

function OnboardingAccounting(props: OnboardingAccountingProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingAccounting
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </OnboardingWrapper>
    );
}

OnboardingAccounting.displayName = 'OnboardingAccounting';

export default OnboardingAccounting;
