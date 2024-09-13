import React from 'react';
import BaseOnboardingAccounting from './BaseOnboardingAccounting';
import type {OnboardingAccountingProps} from './types';

function OnboardingAccounting({...rest}: OnboardingAccountingProps) {
    return (
        <BaseOnboardingAccounting
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingAccounting.displayName = 'OnboardingAccounting';

export default OnboardingAccounting;
