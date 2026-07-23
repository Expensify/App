import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingPrivateDomainProps} from './types';

import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';

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
