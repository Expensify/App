import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';
import type {OnboardingPrivateDomainProps} from './types';

function OnboardingPrivateDomain({...rest}: OnboardingPrivateDomainProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingPrivateDomain
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </OnboardingWrapper>
    );
}

OnboardingPrivateDomain.displayName = 'OnboardingPrivateDomain';

export default OnboardingPrivateDomain;
