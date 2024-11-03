import React from 'react';
import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';
import type {OnboardingPrivateDomainProps} from './types';

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
