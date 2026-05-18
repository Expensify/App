import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';
import type {OnboardingPrivateDomainProps} from './types';

function OnboardingPrivateDomain(props: OnboardingPrivateDomainProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingPrivateDomain
                shouldUseNativeStyles={false}
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingPrivateDomain;
