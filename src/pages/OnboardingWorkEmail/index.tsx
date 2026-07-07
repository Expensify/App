import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingWorkEmailProps} from './types';

import BaseOnboardingWorkEmail from './BaseOnboardingWorkEmail';

function OnboardingWorkEmail(props: OnboardingWorkEmailProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkEmail
                shouldUseNativeStyles={false}
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkEmail;
