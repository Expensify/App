import React from 'react';
import type {OnboardingPrivateDomainProps} from './types';
import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';

function OnboardingPrivateDomain({...rest}: OnboardingPrivateDomainProps) {
    return (
        <BaseOnboardingPrivateDomain
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingPrivateDomain.displayName = 'OnboardingPrivateDomain';

export default OnboardingPrivateDomain;
