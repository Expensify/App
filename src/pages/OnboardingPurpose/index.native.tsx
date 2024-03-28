import React from 'react';
import type {BaseOnboardingPurposeProps} from './BaseOnboardingPurpose';
import BaseOnboardingPurpose from './BaseOnboardingPurpose';

function OnboardingPurpose({...rest}: Omit<Omit<BaseOnboardingPurposeProps, 'shouldUseNativeStyles'>, 'shouldEnableMaxHeight'>) {
    return (
        <BaseOnboardingPurpose
            shouldUseNativeStyles
            shouldEnableMaxHeight={false}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingPurpose.displayName = 'OnboardingPurpose';
export default OnboardingPurpose;
