import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingPrivateDomain from './BaseOnboardingPrivateDomain';
import type {OnboardingPrivateDomainProps} from './types';

function OnboardingPrivateDomain(props: OnboardingPrivateDomainProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingPrivateDomain
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </OnboardingWrapper>
    );
}

OnboardingPrivateDomain.displayName = 'OnboardingPrivateDomain';

export default OnboardingPrivateDomain;
