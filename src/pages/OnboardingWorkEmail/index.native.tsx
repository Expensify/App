import React from 'react';
import BaseOnboardingWorkEmail from './BaseOnboardingWorkEmail';
import type {OnboardingWorkEmailProps} from './types';

function OnboardingWorkEmail(props: OnboardingWorkEmailProps) {
    return (
        <BaseOnboardingWorkEmail
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

OnboardingWorkEmail.displayName = 'OnboardingWorkEmail';

export default OnboardingWorkEmail;
