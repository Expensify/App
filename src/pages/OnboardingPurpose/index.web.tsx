import React from 'react';

import type {OnboardingPurposeProps} from './types';

import BaseOnboardingPurpose from './BaseOnboardingPurpose';

function OnboardingPurpose({...rest}: OnboardingPurposeProps) {
    return (
        <BaseOnboardingPurpose
            shouldUseNativeStyles={false}
            shouldEnableMaxHeight
            {...rest}
        />
    );
}

export default OnboardingPurpose;
