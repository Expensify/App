import React from 'react';
import BaseOnboardingPurpose from './BaseOnboardingPurpose';
import type {OnboardingPurposeProps} from './types';

function OnboardingPurpose({...rest}: OnboardingPurposeProps) {
    return (
        <BaseOnboardingPurpose
            shouldUseNativeStyles={false}
            shouldEnableMaxHeight
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default OnboardingPurpose;
