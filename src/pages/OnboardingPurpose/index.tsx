import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingPurposeProps} from './types';

import BaseOnboardingPurpose from './BaseOnboardingPurpose';

function OnboardingPurpose({...rest}: OnboardingPurposeProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingPurpose
                shouldUseNativeStyles={false}
                shouldEnableMaxHeight={false}
                {...rest}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingPurpose;
