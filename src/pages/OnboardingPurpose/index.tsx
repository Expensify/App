import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingPurpose from './BaseOnboardingPurpose';
import type {OnboardingPurposeProps} from './types';

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
