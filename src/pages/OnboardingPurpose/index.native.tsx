import React from 'react';
import type {BaseOnboardingPurposeProps} from './BaseOnboardingPurpose';
import BaseOnboardingPurpose from './BaseOnboardingPurpose';

function OnboardingPurpose({...rest}: Omit<BaseOnboardingPurposeProps, 'shouldUseNativeStyles'>) {
    return (
        <BaseOnboardingPurpose
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingPurpose.displayName = 'OnboardingPurpose';
export default OnboardingPurpose;
