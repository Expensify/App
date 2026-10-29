import React from 'react';

import type {OnboardingPrivateDomainProps} from './types';

import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';

function OnboardingPrivateDomain(props: OnboardingPrivateDomainProps) {
    return (
        <BaseOnboardingPrivateDomain
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingPrivateDomain;
