import React from 'react';

import type {OnboardingWorkEmailProps} from './types';

import BaseOnboardingWorkEmail from './BaseOnboardingWorkEmail';

function OnboardingWorkEmail(props: OnboardingWorkEmailProps) {
    return (
        <BaseOnboardingWorkEmail
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingWorkEmail;
