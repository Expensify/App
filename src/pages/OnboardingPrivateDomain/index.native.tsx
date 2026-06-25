import React from 'react';
import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';
import type {OnboardingPrivateDomainProps} from './types';

function OnboardingPrivateDomain(props: OnboardingPrivateDomainProps) {
    return (
        <BaseOnboardingPrivateDomain
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingPrivateDomain;
