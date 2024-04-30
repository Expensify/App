import React from 'react';
import BaseOnboardingPurpose from './BaseOnboardingPurpose';
import type {OnboardingPurposeProps} from './types';

function OnboardingPurpose({...rest}: OnboardingPurposeProps) {
    return (
        <BaseOnboardingPurpose
            shouldUseNativeStyles={false}
            shouldEnableMaxHeight={false}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingPurpose.displayName = 'OnboardingPurpose';
export default OnboardingPurpose;
