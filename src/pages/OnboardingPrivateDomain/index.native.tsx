import React from 'react';
import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';
import type {OnboardingPrivateDomainProps} from './types';

function OnboardingPrivateDomain(props: OnboardingPrivateDomainProps) {
    return (
        <BaseOnboardingPrivateDomain
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

OnboardingPrivateDomain.displayName = 'OnboardingPrivateDomain';

export default OnboardingPrivateDomain;
