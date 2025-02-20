import React from 'react';
import BaseOnboardingAccounting from './BaseOnboardingAccounting';
import type {OnboardingAccountingProps} from './types';

function OnboardingAccounting(props: OnboardingAccountingProps) {
    return (
        <BaseOnboardingAccounting
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

OnboardingAccounting.displayName = 'OnboardingAccounting';

export default OnboardingAccounting;
